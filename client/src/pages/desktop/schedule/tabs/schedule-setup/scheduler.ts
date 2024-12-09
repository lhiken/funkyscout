import { Tables } from "../../../../../lib/supabase/database.types";
import { EventSchedule } from "../../../../../lib/tba/events";

function assignUsersToMatches(
   schedule: EventSchedule,
   priorityTeams: string[],
   users: { name: string; uid: string }[],
   maxConsecShift: number,
   event: string,
): Tables<"event_schedule">[] {
   // Create a list of scouters with their shift avaliability
   const userList = users.map((val) => ({
      ...val,
      isOnBreak: false,
      isInShift: true,
      avaliable: true,
      consecScoutMatches: 0,
      consecBreakMatches: 0,
   }));

   const breakLength = maxConsecShift;

   const matchKeys = Object.keys(schedule).filter((
      key,
   ) => key.includes("qm")).sort((a, b) =>
      Number(a.substring(a.indexOf("qm") + 2)) -
      Number(b.substring(a.indexOf("qm") + 2))
   );

   const shifts: Tables<"event_schedule">[] = [];

   for (const matchKey of matchKeys) {
      const matchData = schedule[matchKey];

      //Sort teams in order of priority, then number of matches already scouted
      const matchTeams = [...matchData.blueTeams, ...matchData.redTeams].sort(
         () => Math.random() - 0.5,
      ).sort(
         (a, b) => {
            const aPriority = priorityTeams.includes(a);
            const bPriority = priorityTeams.includes(b);

            if (aPriority && !bPriority) return -1;
            if (bPriority && !aPriority) return 1;

            const aScouted = shifts.filter((match) => match.team == a).length;
            const bScouted = shifts.filter((match) => match.team == b).length;

            return aScouted - bScouted;
         },
      );

      for (const team of matchTeams) {
         const scouter = getAvaliableScouter();

         shifts.push({
            event: event,
            match: matchKey,
            team: team,
            alliance: matchData.blueTeams.includes(team) ? "blue" : "red",
            name: scouter.name,
            uid: scouter.uid,
         });
      }

      updateAvaliability();
   }

   function getAvaliableScouter() {
      const avaliableScouters = userList.filter((user) =>
         user.avaliable && user.isInShift
      );

      if (avaliableScouters.length == 0) {
         return {
            name: null,
            uid: null,
         };
      }

      const targetScouterIndex = userList.findIndex((val) =>
         val.uid == avaliableScouters[0].uid
      );
      const targetScouter = userList[targetScouterIndex];

      userList[targetScouterIndex] = {
         ...userList[targetScouterIndex],
         avaliable: false,
         consecScoutMatches: targetScouter.consecScoutMatches + 1,
      };

      return targetScouter;
   }

   function updateAvaliability() {
      for (let i = 0; i < userList.length; i++) {
         const canBreak = userList[i].consecScoutMatches > maxConsecShift - 1||
            (userList[i].isOnBreak &&
               userList[i].consecBreakMatches < breakLength);
         const canShift =
            userList[i].consecScoutMatches < maxConsecShift - 1&&
               userList[i].isInShift || !canBreak;
         const newBreakLength = canBreak
            ? userList[i].consecBreakMatches + 1
            : 0;

         userList[i] = {
            ...userList[i],
            avaliable: true,
            isOnBreak: canBreak,
            isInShift: canShift,
            consecBreakMatches: newBreakLength,
            consecScoutMatches: canBreak ? 0 : userList[i].consecScoutMatches,
         };
      }
   }

   return shifts;
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
