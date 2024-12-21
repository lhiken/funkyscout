import { Tables } from "../../../../../lib/supabase/database.types";
import { EventSchedule } from "../../../../../lib/tba/events";

interface Scouter {
   name: string;
   uid: string;
   accuracy?: number;
}

interface UnavailableScouter extends Scouter {
   skippedMatches: number; // Number of matches this scouter has not been scouting for
   totalMatches: number;
}

interface AvailableScouter extends Scouter {
   scoutedMatches: number; // Number of matches this scouter has been scouting for
   totalMatches: number; // Total number of matches
   available: boolean; // Whether this scouter has scouted a particular match
}

function assignUsersToMatches(
   schedule: EventSchedule,
   priorityTeams: string[],
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

   // Creates an array of unavailable scouters by mapping over each user and adding
   // unavailable scouter properties
   const unavailableScouterPool: UnavailableScouter[] = users.map((user) => ({
      name: user.name,
      uid: user.uid,
      totalMatches: 0,
      skippedMatches: 0,
   }));

   // Initilizes available scouters by getting 6 scouters from the unavailable scouter pool
   const availableScouterPool: AvailableScouter[] =
      initializeAvailableScouters();

   const shifts: Tables<"event_schedule">[] = [];

   // Assign shifts for each match in matchKeys
   for (const matchKey of matchKeys) {
      const matchData = schedule[matchKey];

      // Sort teamKeys in order of importance; this is what should be edited to
      // make the number of matches each team gets more balanced
      const teamKeys = [...matchData.blueTeams, ...matchData.redTeams].sort(
         (a, b) => {
            const aPriority = priorityTeams.includes(a);
            const bPriority = priorityTeams.includes(b);

            if (aPriority && !bPriority) return -1;
            if (bPriority && !aPriority) return 1;

            const aMatches = shifts.filter((shift) => shift.team === a).length;
            const bMatches = shifts.filter((shift) => shift.team === b).length;

            return aMatches - bMatches;
         },
      );

      // Assign shifts for each team in a match
      for (const team of teamKeys) {
         const scouter = getAvailableScouter();
         shifts.push({
            alliance: matchData.blueTeams.includes(team) ? "blue" : "red",
            event: event,
            match: matchKey,
            team: team,
            name: scouter?.name || null,
            uid: scouter?.uid || null,
         });
      }

      updatePools();
   }

   return shifts;

   function initializeAvailableScouters(): AvailableScouter[] {
      const scouters: AvailableScouter[] = [];
      for (let i = 0; i < Math.min(6, unavailableScouterPool.length); i++) {
         const scouter = unavailableScouterPool.pop();
         if (scouter) {
            scouters.push({
               name: scouter.name,
               uid: scouter.uid,
               scoutedMatches: 0,
               available: true,
               totalMatches: scouter.totalMatches,
            });
         }
      }
      return scouters;
   }

   function getAvailableScouter(): AvailableScouter | undefined {
      availableScouterPool.sort(
         (a, b) =>
            a.totalMatches - b.totalMatches ||
            a.scoutedMatches - b.scoutedMatches,
      );
      const scouter = availableScouterPool.find((s) => s.available);

      if (scouter) {
         scouter.available = false;
         scouter.scoutedMatches++;
         scouter.totalMatches++;
      }

      return scouter;
   }

   function updatePools() {
      unavailableScouterPool.sort((a, b) => a.totalMatches - b.totalMatches);

      for (let i = availableScouterPool.length - 1; i >= 0; i--) {
         const scouter = availableScouterPool[i];
         scouter.available = true;

         if (scouter.scoutedMatches >= maxConsecMatches) {
            moveToUnavailable(i);
         }
      }

      for (let i = unavailableScouterPool.length - 1; i >= 0; i--) {
         const scouter = unavailableScouterPool[i];
         scouter.skippedMatches++;

         if (
            scouter.skippedMatches > breakLength &&
            availableScouterPool.length < 6
         ) {
            moveToAvailable(i);
         }
      }
   }

   function moveToUnavailable(index: number) {
      const scouter = availableScouterPool.splice(index, 1)[0];

      unavailableScouterPool.push({
         name: scouter.name,
         uid: scouter.uid,
         skippedMatches: 0,
         totalMatches: scouter.totalMatches,
      });
   }

   function moveToAvailable(index: number) {
      const scouter = unavailableScouterPool.splice(index, 1)[0];

      availableScouterPool.push({
         name: scouter.name,
         uid: scouter.uid,
         scoutedMatches: 0,
         available: true,
         totalMatches: scouter.totalMatches,
      });
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
