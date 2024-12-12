import { Tables } from "../../../../../lib/supabase/database.types";
import { EventSchedule } from "../../../../../lib/tba/events";

interface Scouter {
   name: string;
   uid: string;
   accuracy?: number;
}

interface UnavailableScouter extends Scouter {
   skippedMatches: number; // Number of matches this scouter has not been scouting for
}

interface AvailableScouter extends Scouter {
   scoutedMatches: number; // Number of matches this scouter has been scouting for
   available: boolean; // Whether this scouter has scouted a particular match
}

function assignUsersToMatches(
   schedule: EventSchedule,
   priorityTeams: string[],
   users: { name: string; uid: string }[],
   maxConsecMatches: number,
   breakLength: number,
   targetShiftLength: number,
   event: string,
): Tables<"event_schedule">[] {
   const matchKeys = Object.keys(schedule).filter((
      key,
   ) => key.includes("qm")).sort((a, b) =>
      Number(a.substring(a.indexOf("qm") + 2)) -
      Number(b.substring(a.indexOf("qm") + 2))
   );

   // Takes all given scouters and puts them into the unavailable scouter pool
   const unavailableScouterPool: UnavailableScouter[] = users.map((val) => ({
      name: val.name,
      uid: val.uid,
      skippedMatches: 0,
   }));

   // Takes some scouters from the unavailable pool and moves them to the available pool
   const availableScouterPool: AvailableScouter[] = getStartingScouters();

   console.log(unavailableScouterPool);
   console.log(availableScouterPool);

   const shifts: Tables<"event_schedule">[] = [];

   for (const matchKey of matchKeys) {
      const matchData = schedule[matchKey];
      const teamKeys = [...matchData.blueTeams, ...matchData.redTeams].sort(
         (a, b) => {
            const aPriority = priorityTeams.includes(a);
            const bPriority = priorityTeams.includes(b);

            if (aPriority && !bPriority) return -1;
            if (bPriority && !aPriority) return 1;

            const aMatches = shifts.filter((val) => val.team == a).length;
            const bMatches = shifts.filter((val) => val.team == b).length;

            return aMatches - bMatches;
         },
      );

      let successfulAssignments = 0;

      for (const team of teamKeys) {
         const scouter = getAvailableScouter();

         if (scouter) {
            successfulAssignments++;
         }

         shifts.push({
            alliance: matchData.blueTeams.includes(team) ? "blue" : "red",
            event: event,
            match: matchKey,
            team: team,
            name: scouter?.name || null,
            uid: scouter?.uid || null,
         });
      }

      updateAvaliability(
         successfulAssignments == 6 ? "relaxed" : "strict",
      );
   }

   return shifts;

   function getAvailableScouter(): AvailableScouter | undefined {
      let index = -1;

      for (let i = 0; i < availableScouterPool.length; i++) {
         if (availableScouterPool[i].available) {
            index = i;
            break;
         }
      }

      if (index == -1) return;

      availableScouterPool[0].available = false;
      availableScouterPool[0].scoutedMatches++;

      const scouter = availableScouterPool.splice(0, 1)[0];
      availableScouterPool.push(scouter);

      return scouter;
   }

   function getStartingScouters() {
      const scouters: AvailableScouter[] = [];

      for (let i = 0; i < unavailableScouterPool.length && i < 6; i++) {
         const newScouter = popUnavailable();
         if (newScouter) {
            scouters.push(newScouter);
         }
      }

      return scouters;
   }

   function updateAvaliability(mode: "strict" | "relaxed") {
      //Updates the avaliable pool
      for (let i = 0; i < availableScouterPool.length; i++) {
         availableScouterPool[i].available = true;

         if (
            availableScouterPool[i].scoutedMatches >= targetShiftLength &&
            mode == "relaxed"
         ) {
            swapAvailable(i);
         } else if (
            availableScouterPool[i].scoutedMatches >= maxConsecMatches
         ) {
            swapAvailable(i);
         }
      }

      for (let i = 0; i < unavailableScouterPool.length; i++) {
         unavailableScouterPool[i].skippedMatches++;

         if (
            availableScouterPool.length < 6 &&
            unavailableScouterPool[i].skippedMatches > breakLength
         ) {
            swapUnavailable(i);
         }
      }
   }

   function swapAvailable(index: number): UnavailableScouter {
      const scouter = availableScouterPool[index];

      availableScouterPool.splice(index, 1);

      const newScouter = {
         name: scouter.name,
         uid: scouter.uid,
         skippedMatches: 0,
      };

      unavailableScouterPool.push(newScouter);

      return newScouter;
   }

   function swapUnavailable(index: number): AvailableScouter {
      const scouter = unavailableScouterPool[index];

      unavailableScouterPool.splice(index, 1);

      const newScouter = {
         name: scouter.name,
         uid: scouter.uid,
         available: true,
         scoutedMatches: 0,
      };

      availableScouterPool.push(newScouter);

      return newScouter;
   }

   function popUnavailable(): AvailableScouter | undefined {
      const scouter = unavailableScouterPool.pop();

      if (!scouter) return;

      return {
         name: scouter.name,
         uid: scouter.uid,
         scoutedMatches: 0,
         available: true,
      };
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
