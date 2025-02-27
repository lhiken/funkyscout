import { PitData2025 } from "../../schemas/defs";
import { handleError } from "../../utils/errorHandler";
import { getEvent } from "../../utils/logic/app";
import {
   deleteData,
   getAllData,
   getScoutedMatchesStoreName,
   getServerMatchesStoreName,
   getTeamDetailsStoreName,
   upsertData,
} from "../mobile-cache-handler/init";
import { getLocalUserData } from "./auth";
import { Json, Tables } from "./database.types";
import supabase from "./supabase";

async function fetchEvents() {
   try {
      const { data: event_list, error } = await supabase
         .from("event_list")
         .select("*")
         .order("date", { ascending: true });

      if (error) {
         throw new Error(error.message);
      }

      return event_list;
   } catch (error) {
      handleError(error);
   }
}

async function fetchEventByKey(key: string) {
   try {
      const { data: event_list, error } = await supabase
         .from("event_list")
         .select("*")
         .eq("event", key);

      if (error) {
         throw new Error(error.message);
      } else if (event_list.length == 0) {
         throw new Error("No event found");
      }

      return event_list[0];
   } catch (error) {
      handleError(error);
      return false;
   }
}

async function fetchTeamsByEvent(event: string) {
   try {
      const { data: event_list, error } = await supabase
         .from("event_team_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_list;
   } catch (error) {
      handleError(error);
   }
}

async function fetchTeamAssignments(event: string) {
   try {
      const { data: event_team_data, error } = await supabase
         .from("event_team_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_team_data;
   } catch (error) {
      handleError(error);
   }
}

async function fetchMatchAssignments(event: string) {
   try {
      const { data: event_schedule, error } = await supabase
         .from("event_schedule")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_schedule;
   } catch (error) {
      handleError(error);
   }
}

async function fetchPicklists(event: string) {
   try {
      const { data: event_picklist, error } = await supabase
         .from("event_picklist")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_picklist;
   } catch (error) {
      handleError(error);
   }
}

async function updatePicklist(picklist: Tables<"event_picklist">) {
   try {
      const { error } = await supabase
         .from("event_picklist")
         .upsert(picklist);

      if (error) {
         throw new Error(error.message);
      } else {
         return true;
      }
   } catch (error) {
      handleError(error);
   }
}

async function deletePicklist(picklist: Tables<"event_picklist">) {
   try {
      const { data: event_picklist, error } = await supabase
         .from("event_picklist")
         .delete()
         .eq("event", picklist.event)
         .eq("id", picklist.id)
         .select();

      if (error) {
         throw new Error(error.message);
      }

      return event_picklist;
   } catch (error) {
      handleError(error);
   }
}

async function fetchMatchDataByEvent(event: string) {
   try {
      const { data: event_match_data, error } = await supabase
         .from("event_match_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_match_data;
   } catch (error) {
      handleError(error);
   }
}

async function fetchTeamDataByEvent(event: string) {
   try {
      const { data: event_team_data, error } = await supabase
         .from("event_team_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_team_data;
   } catch (error) {
      handleError(error);
   }
}

async function uploadMatch(matchData: Tables<"event_match_data">) {
   upsertData(getScoutedMatchesStoreName(), matchData);

   try {
      const { error } = await supabase
         .from("event_match_data")
         .upsert(matchData);

      if (error) {
         throw new Error(error.message);
      } else {
         deleteData(getScoutedMatchesStoreName(), [
            matchData.event,
            matchData.match,
            matchData.team,
         ]);
         upsertData(getServerMatchesStoreName(), matchData);
         uploadAllOfflineMatches();

         return true;
      }
   } catch (error) {
      handleError(error);
      return false;
   }
}

async function uploadAllOfflineMatches() {
   const offlineMatches = await getAllData<Tables<"event_match_data">>(
      getScoutedMatchesStoreName(),
   );

   try {
      const { error } = await supabase
         .from("event_match_data")
         .upsert(offlineMatches);

      if (error) {
         throw new Error(error.message);
      }

      return true;
   } catch (err) {
      handleError(err);
      return false;
   }
}

async function uploadPitEntry(teamKey: string, pitData: PitData2025) {
   const newTeam: Tables<"event_team_data"> = {
      assigned: getLocalUserData().uid,
      data: JSON.parse(JSON.stringify(pitData)) as Json,
      event: getEvent() || "",
      name: getLocalUserData().name,
      timestamp: new Date(Date.now()).toISOString(),
      uid: getLocalUserData().uid,
      team: teamKey,
   };

   try {
      const { error } = await supabase
         .from("event_team_data")
         .upsert(newTeam);

      if (error) {
         throw new Error(error.message);
      } else {
         return true;
      }
   } catch (error) {
      handleError(error);
      localStorage.setItem(`t${teamKey}`, JSON.stringify(pitData));
   }
}

async function uploadOfflinePitEntries() {
   const teams = await getAllData<Tables<"event_team_data">>(
      getTeamDetailsStoreName(),
   );
   for (const team of teams) {
      const target = localStorage.getItem(`t${team.team}`);
      if (target) {
         const data = JSON.parse(target) as PitData2025;
         uploadPitEntry(team.team, data);
      }
   }
}

async function uploadRobotImage(file: File, teamKey: string) {
   const fileName = `${Date.now()}-${file.name}`;
   const filePath = `team-${teamKey}/${getEvent()}/${fileName}`;

   try {
      const { data, error } = await supabase.storage
         .from("team-images")
         .upload(filePath, file);

      if (error) throw error;
      console.log("File uploaded successfully:", data);
      return data;
   } catch (error) {
      handleError(error);
      await saveFileToIndexedDB(file, filePath);
   }
}

async function saveFileToIndexedDB(file: File, filePath: string) {
   try {
      const base64 = await fileToBase64(file);

      const request = indexedDB.open("robotImagesDB", 1);

      request.onupgradeneeded = () => {
         const db = request.result;
         if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images", { keyPath: "filePath" });
         }
      };

      request.onsuccess = () => {
         const db = request.result;
         const transaction = db.transaction("images", "readwrite");
         const store = transaction.objectStore("images");

         store.put({ filePath, base64 });

         transaction.oncomplete = () => {
            console.log("File saved locally in IndexedDB.");
         };

         transaction.onerror = (err) => {
            console.error("Failed to save file locally:", err);
         };
      };

      request.onerror = (err) => {
         console.error("IndexedDB error:", err);
      };
   } catch (err) {
      console.error("Error converting file to Base64:", err);
   }
}

function fileToBase64(file: File): Promise<string> {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
   });
}

async function uploadAllImagesToSupabase() {
   const request = indexedDB.open("robotImagesDB", 1);

   request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction("images", "readonly");
      const store = transaction.objectStore("images");

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async () => {
         const records = getAllRequest.result;

         for (const record of records) {
            try {
               // Decode Base64 to Blob
               const blob = base64ToBlob(record.base64);

               // Upload to Supabase
               const { data, error } = await supabase.storage
                  .from("team-images")
                  .upload(record.filePath, blob);

               if (error) throw error;

               console.log("Uploaded:", data);

               // Delete from IndexedDB after successful upload
               const deleteTransaction = db.transaction("images", "readwrite");
               const deleteStore = deleteTransaction.objectStore("images");
               deleteStore.delete(record.filePath);

               deleteTransaction.oncomplete = () => {
                  console.log(`Deleted ${record.filePath} from IndexedDB.`);
               };
            } catch (err) {
               console.error(`Failed to upload ${record.filePath}:`, err);
            }
         }
      };

      getAllRequest.onerror = (err) => {
         console.error("Failed to get images from IndexedDB:", err);
      };
   };

   request.onerror = (err) => {
      console.error("IndexedDB error:", err);
   };
}

function base64ToBlob(base64: string): Blob {
   const base64Data = base64.split(",")[1];
   const byteCharacters = atob(base64Data);
   const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) =>
      byteCharacters.charCodeAt(i)
   );
   const byteArray = new Uint8Array(byteNumbers);
   return new Blob([byteArray]);
}

export {
   deletePicklist,
   fetchEventByKey,
   fetchEvents,
   fetchMatchAssignments,
   fetchMatchDataByEvent,
   fetchPicklists,
   fetchTeamAssignments,
   fetchTeamDataByEvent,
   fetchTeamsByEvent,
   updatePicklist,
   uploadAllImagesToSupabase,
   uploadAllOfflineMatches,
   uploadMatch,
   uploadOfflinePitEntries,
   uploadPitEntry,
   uploadRobotImage,
};
