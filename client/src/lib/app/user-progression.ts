import {
   getAllData,
   getScheduleStoreName,
   getScoutedMatchesStoreName,
   getTeamDetailsStoreName,
} from "../mobile-cache-handler/init";
import { getLocalUserData } from "../supabase/auth";
import { Tables } from "../supabase/database.types";

export async function getUserScoutingProgress() {
   const userId = getLocalUserData().uid;
   const matchesAssigned =
      ((await getAllData(getScheduleStoreName())) as Tables<"event_schedule">[])
         .filter((val) => val.uid == userId).length;
   const matchesDone =
      ((await getAllData(getScoutedMatchesStoreName())) as Tables<
         "event_schedule"
      >[]).filter((val) => val.uid == userId).length;

   const pitMatches = ((await getAllData(getTeamDetailsStoreName())) as Tables<
      "event_team_data"
   >[]).filter((val) => val.assigned == userId);

   return {
      pitScouting: {
         assigned: pitMatches.length,
         done:
            pitMatches.filter((val) => (val.data?.toString().length || 0) > 3)
               .length,
      },
      matchScouting: { assigned: matchesAssigned, done: matchesDone },
   };
}
