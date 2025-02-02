import {
   getAllData,
   localScheduleStoreName,
   localScoutedMatchesStoreName,
} from "../mobile-cache-handler/init";
import { getLocalUserData } from "../supabase/auth";
import { Tables } from "../supabase/database.types";

export async function getUserScoutingProgress() {
   const userId = getLocalUserData().uid;
   const matchesAssigned =
      ((await getAllData(localScheduleStoreName)) as Tables<"event_schedule">[])
         .filter((val) => val.uid == userId).length;
   const matchesDone =
      ((await getAllData(localScoutedMatchesStoreName)) as Tables<
         "event_schedule"
      >[]).filter((val) => val.uid == userId).length;

   return {
      pitScouting: { assigned: 12, done: 4 },
      matchScouting: { assigned: matchesAssigned, done: matchesDone },
   };
}
