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
   const lastScoutedMatch = scoutedMatches.length &&
      scoutedMatches.reduce((latest, current) => {
         const latestDate = new Date(latest.timestamp);
         const currentDate = new Date(current.timestamp);
         return currentDate > latestDate ? current : latest;
      });

   const currentTime = Date.now();
   let min = data[0].estTime - currentTime;
   let minIndex = 0;
   for (let i = 1; i < data.length; i++) {
      if (
         data[i].estTime < min &&
         data[i].estTime >
            (new Date(lastScoutedMatch != 0 ? lastScoutedMatch.timestamp : 0))
               .getTime()
      ) {
         min = data[i].estTime - currentTime;
         minIndex = i;
      }
   }

   return data[minIndex];
}

export async function getNextAssignedMatch() {
   const userId = getLocalUserData().uid;
   const assignedMatches =
      (await getAllData<Tables<"event_schedule">>(getScheduleStoreName()))
         .filter((val) => val.uid == userId);
   const tbaData = getLocalTBAData() ?? {}; // Default to empty object if null
   const scoutedMatches = await getAllData<Tables<"event_match_data">>(
      getScoutedMatchesStoreName(),
   );

   // Early return if no assigned matches
   if (assignedMatches.length === 0) {
      return null;
   }

   // Get the latest scouted match time
   const lastScoutedTime = scoutedMatches.length > 0
      ? Math.max(
         ...scoutedMatches.map((match) => new Date(match.timestamp).getTime()),
      )
      : 0;

   // Current time for comparisons
   const currentTime = Date.now();

   // Find the next unassigned match
   let nextMatch = null;
   let smallestDiff = Infinity;

   for (const match of assignedMatches) {
      // Safely access TBA data, handling potential nulls
      const matchData = tbaData[match.match];
      const matchTime = matchData?.est_time ?? null;

      // Skip already scouted matches
      const isScoutedMatch = scoutedMatches.some((m) =>
         m.match === match.match
      );
      if (isScoutedMatch) continue;

      // If we have valid TBA data with a timestamp, use time-based comparison
      if (matchTime !== null && !isNaN(matchTime)) {
         // Only consider matches after the last scouted match
         if (matchTime > lastScoutedTime) {
            const timeDiff = Math.abs(matchTime - currentTime);
            if (timeDiff < smallestDiff) {
               smallestDiff = timeDiff;
               nextMatch = {
                  data: match,
                  time: matchTime,
               };
            }
         }
      } else {
         // No valid TBA data - take the first unassigned match we find
         if (nextMatch === null) {
            throwNotification(
               "info",
               "No TBA data found",
            );
            nextMatch = {
               data: match,
               time: (new Date()).getTime(),
            };
         }
      }
   }

   return nextMatch;
}

export async function getNextNearAssignedMatches() {
   const userId = getLocalUserData().uid;
   const assignedMatches =
      (await getAllData<Tables<"event_schedule">>(getScheduleStoreName()))
         .filter((val) => val.uid == userId);
   const tbaData = getLocalTBAData();
   const scoutedMatches = await getAllData<Tables<"event_match_data">>(
      getScoutedMatchesStoreName(),
   );

   // Early return if no assigned matches
   if (assignedMatches.length === 0) return [];

   // Create a Set of scouted match IDs for O(1) lookup
   const scoutedMatchIds = new Set(scoutedMatches.map((m) => m.match));

   // Get current timestamp once
   const currentTime = Date.now();

   // Create a sorted array of matches with their metadata
   const matchesWithMetadata = assignedMatches
      .map((match) => {
         // Extract match number from match key (e.g., "qm123" -> 123)
         const matchNumber = parseInt(match.match.replace(/\D/g, "")) || 0;

         // Get TBA time if available, otherwise use match number for ordering
         const tbaTime = tbaData[match.match]?.est_time;

         return {
            match,
            matchNumber,
            // If TBA time exists, use it for difference calculation
            timeDiff: tbaTime ? Math.abs(tbaTime - currentTime) : Infinity,
            scouted: scoutedMatchIds.has(match.match),
         };
      })
      // Sort primarily by TBA time difference if available, fall back to match number
      .sort((a, b) => {
         // If neither has TBA time, sort by match number
         if (a.timeDiff === Infinity && b.timeDiff === Infinity) {
            return a.matchNumber - b.matchNumber;
         }
         // If only one has TBA time, prioritize the one with TBA time
         if (a.timeDiff === Infinity) return 1;
         if (b.timeDiff === Infinity) return -1;
         // If both have TBA time, sort by time difference
         return a.timeDiff - b.timeDiff;
      });

   // Find first unscouted match
   const nextMatchIndex = matchesWithMetadata.findIndex((m) => !m.scouted);

   // Handle case where no unscouted matches exist
   if (nextMatchIndex === -1) return [];

   // Pre-calculate array length for bounds checking
   const arrayLength = matchesWithMetadata.length;
   const result: {
      data: Tables<"event_schedule">,
      time: number | null,
      scouted: boolean
   }[] = new Array(5).fill(null);

   // Fill in matches centered around the next match
   for (let i = -2; i <= 2; i++) {
      const targetIndex = nextMatchIndex + i;
      if (targetIndex >= 0 && targetIndex < arrayLength) {
         const matchData = matchesWithMetadata[targetIndex];
         result[i + 2] = {
            data: matchData.match,
            time: tbaData[matchData.match.match]?.est_time || null,
            scouted: matchData.scouted,
         };
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

   // Early return if no matches
   if (data.length === 0) return [];

   const currentTime = Date.now();

   // Find match closest to current time
   let minDiff = Math.abs(data[0].estTime - currentTime);
   let minIndex = 0;

   for (let i = 1; i < data.length; i++) {
      const timeDiff = Math.abs(data[i].estTime - currentTime);
      if (timeDiff < minDiff) {
         minDiff = timeDiff;
         minIndex = i;
      }
   }

   // Pre-calculate array bounds
   const maxIndex = data.length - 1;

   // Create result array with desired order
   const result = [
      data[minIndex], // nextMatch
      minIndex + 1 <= maxIndex ? data[minIndex + 1] : null, // nextMatch + 1
      minIndex + 2 <= maxIndex ? data[minIndex + 2] : null, // nextMatch + 2
      minIndex - 1 >= 0 ? data[minIndex - 1] : null, // nextMatch - 1
      minIndex - 2 >= 0 ? data[minIndex - 2] : null, // nextMatch - 2
   ];

   return result;
}
