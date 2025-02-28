import throwNotification from "../../components/app/toast/toast";
import {
   getAllData,
   getLocalTBAData,
   getMatchDetailsStoreName,
   getScheduleStoreName,
   getScoutedMatchesStoreName,
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
   const scoutedMatches = await getAllData<Tables<"event_match_data">>(
      getScoutedMatchesStoreName(),
   );

   if (assignedMatches.length === 0) {
      return null;
   }

   const lastScoutedTime = scoutedMatches.length > 0
      ? Math.max(
         ...scoutedMatches.map((match) => new Date(match.timestamp).getTime()),
      )
      : 0;

   const currentTime = Date.now();
   let nextMatch = null;
   let smallestDiff = Infinity;

   for (const match of assignedMatches) {
      const matchData = tbaData[match.match];
      const matchTime = matchData?.est_time ?? null;

      // Skip if already scouted
      if (scoutedMatches.some((m) => m.match === match.match)) continue;

      if (
         matchTime !== null && !isNaN(matchTime) &&
         matchTime > Math.max(currentTime, lastScoutedTime)
      ) {
         const diff = matchTime - currentTime;
         if (diff < smallestDiff) {
            smallestDiff = diff;
            nextMatch = { data: match, time: matchTime };
         }
      } else if (nextMatch === null) {
         throwNotification("info", "No TBA data found");
         nextMatch = { data: match, time: currentTime };
      }
   }

   return nextMatch;
}

export async function getNextNearAssignedMatches() {
   const userId = getLocalUserData().uid;
   const assignedMatches =
      (await getAllData<Tables<"event_schedule">>(getScheduleStoreName()))
         .filter((val) => val.uid === userId);
   const tbaData = getLocalTBAData();
   const scoutedMatches = await getAllData<Tables<"event_match_data">>(
      getScoutedMatchesStoreName(),
   );

   if (assignedMatches.length === 0) return [];

   const scoutedMatchIds = new Set(scoutedMatches.map((m) => m.match));
   const currentTime = Date.now();

   const matchesWithMetadata = assignedMatches
      .map((match) => {
         const matchNumber = parseInt(match.match.replace(/\D/g, "")) || 0;
         const tbaTime = tbaData[match.match]?.est_time;
         // Only use a valid, future tbaTime; otherwise, use Infinity.
         const diff = tbaTime && tbaTime > currentTime
            ? tbaTime - currentTime
            : Infinity;
         return {
            match,
            matchNumber,
            timeDiff: diff,
            scouted: scoutedMatchIds.has(match.match),
         };
      })
      .sort((a, b) => {
         if (a.timeDiff === Infinity && b.timeDiff === Infinity) {
            return a.matchNumber - b.matchNumber;
         }
         if (a.timeDiff === Infinity) return 1;
         if (b.timeDiff === Infinity) return -1;
         return a.timeDiff - b.timeDiff;
      });

   const nextMatchIndex = matchesWithMetadata.findIndex((m) => !m.scouted);
   if (nextMatchIndex === -1) return [];

   const arrayLength = matchesWithMetadata.length;
   const result: {
      data: Tables<"event_schedule">;
      time: number | null;
      scouted: boolean;
   }[] = [];

   for (let i = -2; i <= 2; i++) {
      const targetIndex = nextMatchIndex + i;
      if (targetIndex >= 0 && targetIndex < arrayLength) {
         const matchData = matchesWithMetadata[targetIndex];
         result.push({
            data: matchData.match,
            time: tbaData[matchData.match.match]?.est_time || null,
            scouted: matchData.scouted,
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
