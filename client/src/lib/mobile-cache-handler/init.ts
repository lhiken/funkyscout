import { getEvent } from "../../utils/logic/app";
import { getLocalUserData } from "../supabase/auth";
import {
   fetchMatchAssignments,
   fetchMatchDataByEvent,
   fetchTeamsByEvent,
} from "../supabase/data";
import { Json, Tables } from "../supabase/database.types";
import {
   EventSchedule,
   EventScheduleEntry,
   fetchTBAMatchSchedule,
} from "../tba/events";

export const DB_VERSION = 4;

export const idbName = () => `cacheDB_${getLocalUserData()?.uid || "NOUSER"}`;
export const getScheduleStoreName = () =>
   `localSchedule_${getEvent() || "NOEVENT"}`;
export const getScoutedMatchesStoreName = () =>
   `localScoutedMatches_${getEvent() || "NOEVENT"}`;
export const getServerMatchesStoreName = () =>
   `localServerMatches_${getEvent() || "NOEVENT"}`;
export const getMatchDetailsStoreName = () =>
   `localMatchDetails_${getEvent() || "NOEVENT"}`;
export const getTeamDetailsStoreName = () =>
   `localTeamDetails_${getEvent() || "NOEVENT"}`;
export const getLocalTBADataName = () =>
   `localTBAData_${getEvent() || "NOEVENT"}`;

export default async function initializeMobileCache(
   progressCallback?: (progress: string) => void,
) {
   const eventKey = getEvent() || "";
   if (progressCallback) progressCallback("(1/6) Fetching event schedule");
   const eventSchedule: Tables<"event_schedule">[] =
      await fetchMatchAssignments(
         eventKey,
      ) || [];
   if (progressCallback) progressCallback("(2/6) Fetching event schedule");
   const serverMatches: Tables<"event_match_data">[] =
      await fetchMatchDataByEvent(
         eventKey,
      ) || [];
   if (progressCallback) progressCallback("(3/6) Fetching match details");
   const teamDetails: Tables<"event_team_data">[] =
      await fetchTeamsByEvent(eventKey) || [];
   if (progressCallback) progressCallback("(4/6) Fetching match details");
   const TBAMatchSchedule = await fetchTBAMatchSchedule(eventKey);
   const matchDetails: EventScheduleEntry[] = Object.entries(
      TBAMatchSchedule || {},
   ).map(([key, value]) => {
      return {
         matchKey: key,
         redTeams: value.redTeams,
         blueTeams: value.blueTeams,
         estTime: value.est_time,
      };
   });
   if (progressCallback) progressCallback("(5/6) Creating local cache");

   await openLocalCache();
   updateLocalTBACache(TBAMatchSchedule);

   bulkUpsertData(getScheduleStoreName(), eventSchedule);
   if (progressCallback) progressCallback("(6/6) Updating local cache");
   bulkUpsertData(getServerMatchesStoreName(), serverMatches);
   bulkUpsertData(getTeamDetailsStoreName(), teamDetails);
   bulkUpsertData(getMatchDetailsStoreName(), matchDetails);
}

export function updateLocalTBACache(data: EventSchedule | undefined) {
   if (data) {
      localStorage.setItem(getLocalTBADataName(), JSON.stringify(data));
   }
}

export function getLocalTBAData() {
   return JSON.parse(
      localStorage.getItem(getLocalTBADataName()) || "[]",
   ) as EventSchedule;
}

export async function insertData(storeName: string, data: Json) {
   const store = await openTransaction(storeName, "readwrite");

   return new Promise((resolve, reject) => {
      const request = store.add(data);

      request.onsuccess = () => {
         resolve(data);
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

export async function upsertData(storeName: string, data: Json) {
   const store = await openTransaction(storeName, "readwrite");

   return new Promise((resolve, reject) => {
      const request = store.put(data);

      request.onsuccess = () => {
         resolve(data);
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

export async function deleteData(storeName: string, key: IDBValidKey) {
   const store = await openTransaction(storeName, "readwrite");

   return new Promise((resolve, reject) => {
      const data = store.get(key);
      const request = store.delete(key);

      request.onsuccess = () => {
         resolve(data);
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

export async function getData(storeName: string, key: IDBValidKey) {
   const store = await openTransaction(storeName, "readwrite");

   return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
         resolve(request.result);
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

export async function bulkInsertData<T>(
   storeName: string,
   dataArray: T[],
): Promise<void> {
   const store = await openTransaction(storeName, "readwrite");

   return new Promise((resolve, reject) => {
      if (dataArray == null) reject();

      dataArray!.forEach((data) => {
         store.add(data);
      });

      store.transaction.oncomplete = () => {
         resolve();
      };

      store.transaction.onerror = () => {
         reject(store.transaction.error);
      };
   });
}

export async function bulkUpsertData<T>(
   storeName: string,
   dataArray: T[],
): Promise<void> {
   const store = await openTransaction(storeName, "readwrite");

   return new Promise((resolve, reject) => {
      if (dataArray == null) reject();

      dataArray!.forEach((data) => {
         store.put(data);
      });

      store.transaction.oncomplete = () => {
         resolve();
      };

      store.transaction.onerror = () => {
         reject(store.transaction.error);
      };
   });
}

export async function getAllData<T>(
   storeName: string,
): Promise<T[]> {
   const store = await openTransaction(storeName, "readonly");

   return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
         resolve(request.result as T[]);
      };

      request.onerror = () => {
         reject(request.error);
      };
   });
}

async function openLocalCache(): Promise<IDBDatabase> {
   return new Promise((resolve, reject) => {
      const idbOpenRequest = indexedDB.open(idbName(), DB_VERSION);

      idbOpenRequest.onupgradeneeded = (event) => {
         const db = (event.target as IDBOpenDBRequest).result;
         if (!db.objectStoreNames.contains(getScheduleStoreName())) {
            db.createObjectStore(getScheduleStoreName(), {
               keyPath: ["event", "match", "team"],
            });
         }
         if (!db.objectStoreNames.contains(getScoutedMatchesStoreName())) {
            db.createObjectStore(getScoutedMatchesStoreName(), {
               keyPath: ["event", "match", "team"],
            });
         }
         if (!db.objectStoreNames.contains(getServerMatchesStoreName())) {
            db.createObjectStore(getServerMatchesStoreName(), {
               keyPath: ["event", "match", "team"],
            });
         }
         if (!db.objectStoreNames.contains(getMatchDetailsStoreName())) {
            db.createObjectStore(getMatchDetailsStoreName(), {
               keyPath: ["matchKey"],
            });
         }
         if (!db.objectStoreNames.contains(getTeamDetailsStoreName())) {
            db.createObjectStore(getTeamDetailsStoreName(), {
               keyPath: ["team"],
            });
         }
      };

      idbOpenRequest.onsuccess = () => {
         resolve(idbOpenRequest.result);
      };

      idbOpenRequest.onerror = () => {
         reject(idbOpenRequest.error);
      };
   });
}

async function openTransaction(
   storeName: string,
   mode: "readonly" | "readwrite",
): Promise<IDBObjectStore> {
   const db = await openLocalCache();
   const transaction = db.transaction(storeName, mode);
   return transaction.objectStore(storeName);
}

export async function checkDatabaseInitialization(): Promise<boolean> {
   return new Promise((resolve, reject) => {
      const request = indexedDB.open(idbName());

      request.onsuccess = () => {
         const db = request.result;

         const storeNames = Array.from(db.objectStoreNames);
         const allStoresExist = [
            getScheduleStoreName(),
            getScoutedMatchesStoreName(),
            getServerMatchesStoreName(),
            getTeamDetailsStoreName(),
            getMatchDetailsStoreName(),
         ].every((store) => storeNames.includes(store));

         db.close();
         resolve(allStoresExist);
      };

      request.onerror = () => {
         reject(request.error);
      };

      request.onupgradeneeded = () => {
         resolve(false);
      };
   });
}
