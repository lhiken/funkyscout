import { Tables } from "../../../../../lib/supabase/database.types";
import { EventSchedule } from "../../../../../lib/tba/events";

// interface Scouter {
//    name: string;
//    uid: string;
//    accuracy?: number;
// }

// interface UnavailableScouter extends Scouter {
//    skippedMatches: number; // Number of matches this scouter has not been scouting for
//    totalMatches: number;
// }

// interface AvailableScouter extends Scouter {
//    scoutedMatches: number; // Number of matches this scouter has been scouting for
//    totalMatches: number; // Total number of matches
//    available: boolean; // Whether this scouter has scouted a particular match
// }
function assignUsersToMatches(
   schedule: EventSchedule,
   priorityTeams: string[],
   lowPriorityTeams: string[],
   users: { name: string; uid: string }[],
   maxConsecMatches: number,
   breakLength: number,
   event: string,
): Tables<"event_schedule">[] {
   // Converts schedule into match keys array with only qualification matches
   const matchKeys = Object.keys(schedule).filter((key) => key.includes("qm"))
      .sort((a, b) =>
         Number(a.substring(a.indexOf("qm") + 2)) -
         Number(b.substring(b.indexOf("qm") + 2))
      );

   if (!Array.isArray(users)) {
      console.error("Expected 'users' to be an array, but got:", users);
      return [];
   }

   // Create a pool of all scouters with tracking for their assignments
   const scouterPool = users.map((user) => ({
      name: user.name,
      uid: user.uid,
      totalMatches: 0,
      currentStreak: 0, // Current streak of consecutive matches
      isActive: false, // Whether the scouter is currently on an active streak
      lastMatchIndex: -1, // Last match this scouter was assigned to
      breakUntilMatch: -1, // Match index when the scouter will be available again
   }));

   const shifts: Tables<"event_schedule">[] = [];

   // Process each match
   for (let matchIndex = 0; matchIndex < matchKeys.length; matchIndex++) {
      const matchKey = matchKeys[matchIndex];
      const matchData = schedule[matchKey];

      // Sort team keys by priority and current scouting coverage
      const teamKeys = sortTeamsByPriority(matchData, shifts);

      // Track which scouters are already assigned to this match
      const assignedScoutersForThisMatch = new Set<string>();

      // Assign shifts for each team in the match
      for (const team of teamKeys) {
         // Find the best scouter for this shift
         const scouter = getBestScouter(
            matchIndex,
            assignedScoutersForThisMatch,
         );

         if (scouter) {
            // Add this scouter to the assigned set for this match
            assignedScoutersForThisMatch.add(scouter.uid);

            // Assign the scouter to this match
            shifts.push({
               alliance: matchData.blueTeams.includes(team) ? "blue" : "red",
               event: event,
               match: matchKey,
               team: team,
               name: scouter.name,
               uid: scouter.uid,
            });

            // Update scouter stats
            scouter.totalMatches++;
            scouter.currentStreak++;
            scouter.lastMatchIndex = matchIndex;
            scouter.isActive = true;

            // If scouter reached max consecutive matches, set them to take a break
            if (scouter.currentStreak >= maxConsecMatches) {
               scouter.breakUntilMatch = matchIndex + breakLength + 1;
               scouter.isActive = false;
               scouter.currentStreak = 0;
            }
         } else {
            // No available scouter
            shifts.push({
               alliance: matchData.blueTeams.includes(team) ? "blue" : "red",
               event: event,
               match: matchKey,
               team: team,
               name: null,
               uid: null,
            });
         }
      }

      // Check if any scouters are coming off break
      for (const scouter of scouterPool) {
         if (!scouter.isActive && scouter.breakUntilMatch <= matchIndex) {
            scouter.currentStreak = 0; // Reset streak counter
         }
      }
   }

   return shifts;

   // Helper functions
   function sortTeamsByPriority(
      matchData: {
         redTeams: string[];
         blueTeams: string[];
         est_time: number;
      },
      currentShifts: Tables<"event_schedule">[],
   ) {
      return [...matchData.blueTeams, ...matchData.redTeams].sort((a, b) => {
         // First priority: high priority teams
         const aPriority = priorityTeams && priorityTeams.includes(a);
         const bPriority = priorityTeams && priorityTeams.includes(b);

         if (aPriority && !bPriority) return -1;
         if (bPriority && !aPriority) return 1;

         // Second priority: not low priority teams
         const aLowPriority = lowPriorityTeams && lowPriorityTeams.includes(a);
         const bLowPriority = lowPriorityTeams && lowPriorityTeams.includes(b);

         if (aLowPriority && !bLowPriority) return 1;
         if (bLowPriority && !aLowPriority) return -1;

         // Third priority: teams with fewer scouted matches
         const aScoutedMatches = currentShifts.filter((shift) =>
            shift.team === a && shift.name != null
         ).length;

         const bScoutedMatches = currentShifts.filter((shift) =>
            shift.team === b && shift.name != null
         ).length;

         return aScoutedMatches - bScoutedMatches;
      });
   }

   function getBestScouter(
      currentMatchIndex: number,
      assignedScoutersForThisMatch: Set<string>,
   ) {
      // Filter out scouters already assigned to this match
      const eligibleScouterPool = scouterPool.filter((scouter) =>
         !assignedScoutersForThisMatch.has(scouter.uid)
      );

      if (eligibleScouterPool.length === 0) {
         return null;
      }

      // First, prioritize scouters who are already on an active streak
      const activeScouters = eligibleScouterPool.filter((scouter) =>
         scouter.isActive &&
         scouter.currentStreak < maxConsecMatches &&
         scouter.lastMatchIndex === currentMatchIndex - 1
      );

      if (activeScouters.length > 0) {
         // Sort active scouters by total matches
         return activeScouters.sort((a, b) =>
            a.totalMatches - b.totalMatches
         )[0];
      }

      // If no active scouters are available, look for scouters who can start a new streak
      const availableScouters = eligibleScouterPool.filter((scouter) =>
         (!scouter.isActive && currentMatchIndex >= scouter.breakUntilMatch) ||
         (scouter.isActive && scouter.lastMatchIndex !== currentMatchIndex - 1)
      );

      if (availableScouters.length === 0) {
         return null;
      }

      // For scouters starting a new streak, prioritize those with fewer total matches
      return availableScouters.sort((a, b) => {
         // Primary sort: total matches (ascending)
         if (a.totalMatches !== b.totalMatches) {
            return a.totalMatches - b.totalMatches;
         }

         // Secondary sort: break duration completed (descending)
         // This ensures scouters who have completed their full break are prioritized
         const aBreakCompletion = currentMatchIndex - a.breakUntilMatch;
         const bBreakCompletion = currentMatchIndex - b.breakUntilMatch;
         return bBreakCompletion - aBreakCompletion;
      })[0];
   }
}

function assignUsersToTeams(
   teams: string[],
   users: { name: string; uid: string }[],
   event: string,
): Tables<"event_team_data">[] {
   const result = [];
   const timestamp = new Date().toISOString();
   const numUsers = users.length;

   for (let i = 0; i < teams.length; i++) {
      const user = users[i % numUsers];
      result.push({
         assigned: user.uid,
         data: {},
         event: event,
         name: null,
         team: teams[i],
         timestamp: timestamp,
         uid: null,
      });
   }

   return result;
}

export { assignUsersToMatches, assignUsersToTeams };
