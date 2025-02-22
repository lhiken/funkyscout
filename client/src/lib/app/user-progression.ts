import {
   getAllData,
   getLocalTBAData,
   getScheduleStoreName,
   getScoutedMatchesStoreName,
   getServerMatchesStoreName,
   getTeamDetailsStoreName,
} from "../mobile-cache-handler/init";
import { getLocalUserData } from "../supabase/auth";
import { Tables } from "../supabase/database.types";
import { getNextAssignedMatch } from "./helpers";

export async function getUserScoutingProgress() {
   const userId = getLocalUserData().uid;
   const matchesAssigned =
      ((await getAllData(getScheduleStoreName())) as Tables<"event_schedule">[])
         .filter((val) => val.uid == userId).length;
   const matchesDone = [
      ...((await getAllData(getServerMatchesStoreName())) as Tables<
         "event_schedule"
      >[]),
      ...((await getAllData(getScoutedMatchesStoreName())) as Tables<
         "event_schedule"
      >[]),
   ].filter((val) => val.uid == userId).length;

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

export async function getShiftsUntilBreak() {
   const nextShift = await getNextAssignedMatch();
   const userID = getLocalUserData().uid;
   const allShifts =
      (await getAllData<Tables<"event_schedule">>(getScheduleStoreName()))
         .filter((val) => val.uid == userID && val.match.includes("qm"))
         .sort((a, b) =>
            Number(a.match.split("_")[1].substring(2)) -
            Number(b.match.split("_")[1].substring(2))
         );
   const times = getLocalTBAData();

   for (let i = 0; i < allShifts.length - 1; i++) {
      const currentMatch = allShifts[i].match;
      const nextMatch = allShifts[i + 1].match;
      const currentTime = times[currentMatch].est_time;
      const nextTime = times[nextMatch].est_time;

      if ((nextTime - currentTime) > 10 * 60) {
         return i + 1;
      }

      if (nextMatch == nextShift?.data.match) {
         return i + 1;
      }
   }

   return allShifts.length;
}
