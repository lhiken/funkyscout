import { getEvent } from "../../utils/logic/app";
import { getLocalUserData } from "../supabase/auth";
import {
   fetchMatchAssignments,
   fetchMatchDataByEvent,
   fetchTeamsByEvent,
} from "../supabase/data";
import { Json, Tables } from "../supabase/database.types";
import { EventScheduleEntry, fetchTBAMatchSchedule } from "../tba/events";

export const DB_VERSION = 3;

export const idbName = `cacheDB_${getLocalUserData()?.uid || "NOUSER"}`;
export const localScheduleStoreName = `localSchedule_${
   getEvent() || "NOEVENT"
}`;
export const localScoutedMatchesStoreName = `localScoutedMatches_${
   getEvent() || "NOEVENT"
}`;
export const localServerMatchesStoreName = `localServerMatches_${
   getEvent() || "NOEVENT"
}`;
export const localMatchDetailsStoreName = `localMatchDetails_${
   getEvent() || "NOEVENT"
}`;
export const localTeamDetailsStoreName = `localTeamDetails_${
   getEvent() || "NOEVENT"
}`;

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
   const matchDetails: EventScheduleEntry[] = Object.entries(
      (await fetchTBAMatchSchedule(eventKey)) || {},
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

   bulkUpsertData(localScheduleStoreName, eventSchedule);
   if (progressCallback) progressCallback("(6/6) Updating local cache");
   bulkUpsertData(localServerMatchesStoreName, serverMatches);
   bulkUpsertData(localTeamDetailsStoreName, teamDetails);
   bulkUpsertData(localMatchDetailsStoreName, matchDetails);
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
      const idbOpenRequest = indexedDB.open(idbName, DB_VERSION);

      idbOpenRequest.onupgradeneeded = (event) => {
         const db = (event.target as IDBOpenDBRequest).result;
         if (!db.objectStoreNames.contains(localScheduleStoreName)) {
            db.createObjectStore(localScheduleStoreName, {
               keyPath: ["event", "match", "team"],
            });
         }
         if (!db.objectStoreNames.contains(localScoutedMatchesStoreName)) {
            db.createObjectStore(localScoutedMatchesStoreName, {
               keyPath: ["event", "match", "team"],
            });
         }
         if (!db.objectStoreNames.contains(localServerMatchesStoreName)) {
            db.createObjectStore(localServerMatchesStoreName, {
               keyPath: ["event", "match", "team"],
            });
         }
         if (!db.objectStoreNames.contains(localMatchDetailsStoreName)) {
            db.createObjectStore(localMatchDetailsStoreName, {
               keyPath: ["matchKey"],
            });
         }
         if (!db.objectStoreNames.contains(localTeamDetailsStoreName)) {
            db.createObjectStore(localTeamDetailsStoreName, {
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
      const request = indexedDB.open(idbName);

      request.onsuccess = () => {
         const db = request.result;

         const storeNames = Array.from(db.objectStoreNames);
         const allStoresExist = [
            localScheduleStoreName,
            localScoutedMatchesStoreName,
            localServerMatchesStoreName,
            localTeamDetailsStoreName,
            localMatchDetailsStoreName,
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
