import throwNotification from "../../components/app/toast/toast";
import {
   getAllData,
   getLocalTBAData,
   getMatchDetailsStoreName,
   getScheduleStoreName,
   getScoutedMatchesStoreName,
   getServerMatchesStoreName,
} from "../mobile-cache-handler/init";
import { getLocalUserData } from "../supabase/auth";
import { Tables } from "../supabase/database.types";
import { EventScheduleEntry } from "../tba/events";

export async function getNextMatch() {
   const data = await getAllData<EventScheduleEntry>(
      getMatchDetailsStoreName(),
   );
   const scoutedMatches = await getAllData<Tables<"event_match_data">>(
      getScoutedMatchesStoreName(),
   );

   // Get the last scouted match timestamp if any
   const lastScoutedMatch = scoutedMatches.length
      ? scoutedMatches.reduce((latest, current) =>
         new Date(current.timestamp).getTime() >
               new Date(latest.timestamp).getTime()
            ? current
            : latest
      )
      : null;
   const lastScoutedTimestamp = lastScoutedMatch
      ? new Date(lastScoutedMatch.timestamp).getTime()
      : 0;

   const currentTime = Date.now();
   let minDiff = Infinity;
   let nextMatch: EventScheduleEntry | null = null;

   for (const match of data) {
      // Only consider matches that are in the future and after the last scouted match
      if (match.estTime > Math.max(currentTime, lastScoutedTimestamp)) {
         const diff = match.estTime - currentTime;
         if (diff < minDiff) {
            minDiff = diff;
            nextMatch = match;
         }
      }
   }
   return nextMatch;
}

export async function getNextAssignedMatch() {
   const userId = getLocalUserData().uid;
   const assignedMatches =
      (await getAllData<Tables<"event_schedule">>(getScheduleStoreName()))
         .filter((val) => val.uid === userId);
   const tbaData = getLocalTBAData() ?? {};
   const scoutedMatches = [
      ...await getAllData<Tables<"event_match_data">>(
         getScoutedMatchesStoreName(),
      ),
      ...(await getAllData<Tables<"event_match_data">>(
         getServerMatchesStoreName(),
      )).filter((val) => val.data != null && val.uid == getLocalUserData().uid),
   ];
   let noTimedata: boolean = false;

   if (assignedMatches.length === 0) {
      return null;
   }

   const scoutedMatchIds = new Set(scoutedMatches.map((m) => m.match));

   // Helper function to extract match number from match key
   const getMatchNumber = (matchKey: string) => {
      // Extract number from format like "2025casf_qm22"
      const match = matchKey.split("_")[1] || "";
      const num = match.replace(/\D/g, ""); // Remove non-digits
      return parseInt(num) || 0;
   };

   // Filter unscounted matches and map with time data
   const eligibleMatches = assignedMatches
      .filter((match) => !scoutedMatchIds.has(match.match))
      .map((match) => {
         // If no time data, use midnight (00:00) of the current day
         const midnight = new Date();
         midnight.setHours(0, 0, 0, 0);

         const matchTime = tbaData[match.match]?.est_time ?? midnight.getTime();
         if (matchTime == midnight.getTime()) noTimedata = true;
         return {
            data: match,
            time: matchTime * 1000,
            matchNumber: getMatchNumber(match.match),
         };
      })
      .sort((a, b) => a.matchNumber - b.matchNumber); // Sort by match number first

   if (noTimedata) throwNotification("info", "No TBA time data");

   // Return the first match
   if (eligibleMatches.length > 0) {
      return { data: eligibleMatches[0].data, time: eligibleMatches[0].time };
   }

   if (noTimedata) {
      return null;
   }
}

export async function getNextNearAssignedMatches() {
   const userId = getLocalUserData().uid;
   const assignedMatches =
      (await getAllData<Tables<"event_schedule">>(getScheduleStoreName()))
         .filter((val) => val.uid === userId);
   const tbaData = getLocalTBAData() ?? {};
   const scoutedMatches = [
      ...await getAllData<Tables<"event_match_data">>(
         getScoutedMatchesStoreName(),
      ),
      ...(await getAllData<Tables<"event_match_data">>(
         getServerMatchesStoreName(),
      )).filter((val) => val.data != null && val.uid == getLocalUserData().uid),
   ];

   if (assignedMatches.length === 0) return [];

   // First get the next match using the previous function
   const nextMatch = await getNextAssignedMatch();
   if (!nextMatch) return [];

   const scoutedMatchIds = new Set(scoutedMatches.map((m) => m.match));

   // Helper function to extract match number
   const getMatchNumber = (matchKey: string) => {
      const match = matchKey.split("_")[1] || "";
      const num = match.replace(/\D/g, "");
      return parseInt(num) || 0;
   };

   // Sort all matches by match number
   const sortedMatches = [...assignedMatches].sort((a, b) => {
      return getMatchNumber(a.match) - getMatchNumber(b.match);
   });

   // Find the index of the next match in our sorted array
   const nextMatchIndex = sortedMatches.findIndex(
      (match) => match.match === nextMatch.data.match,
   );

   if (nextMatchIndex === -1) return [];

   const result: {
      data: Tables<"event_schedule">;
      time: number | null;
      scouted: boolean;
   }[] = [];

   // Get 2 matches before and 2 matches after the next match
   for (let i = -2; i <= 2; i++) {
      const targetIndex = nextMatchIndex + i;
      if (targetIndex >= 0 && targetIndex < sortedMatches.length) {
         const matchData = sortedMatches[targetIndex];
         const matchTime = tbaData[matchData.match]?.est_time;

         result.push({
            data: matchData,
            // Convert time to milliseconds if available
            time: matchTime ? matchTime * 1000 : null,
            scouted: scoutedMatchIds.has(matchData.match),
         });
      }
   }

   return result;
}

/** getNearNextMatches
 * Gets the nearest 5 matches relative to current time;
 * Order is [nextMatch, nextMatch + 1, nextMatch + 2, nextMatch - 1, nextMatch - 2]
 */
export async function getNearNextMatches() {
   const data = await getAllData<EventScheduleEntry>(
      getMatchDetailsStoreName(),
   );
   if (data.length === 0) return [];

   const currentTime = Date.now();
   // Filter to only future matches
   const futureMatches = data.filter((match) => match.estTime >= currentTime);
   if (futureMatches.length === 0) return [];

   let minDiff = Infinity;
   let minIndex = 0;

   for (let i = 0; i < futureMatches.length; i++) {
      const diff = futureMatches[i].estTime - currentTime;
      if (diff < minDiff) {
         minDiff = diff;
         minIndex = i;
      }
   }

   const maxIndex = futureMatches.length - 1;
   const result = [
      futureMatches[minIndex], // nextMatch
      minIndex + 1 <= maxIndex ? futureMatches[minIndex + 1] : null, // nextMatch + 1
      minIndex + 2 <= maxIndex ? futureMatches[minIndex + 2] : null, // nextMatch + 2
      minIndex - 1 >= 0 ? futureMatches[minIndex - 1] : null, // previous match
      minIndex - 2 >= 0 ? futureMatches[minIndex - 2] : null, // match before previous
   ];

   return result;
}
