import { Tables } from "../../../../../lib/supabase/database.types";

// function assignUsersToMatches(
//    schedule: EventSchedule,
//    priorityTeams: string[],
//    users: { name: string; uid: string }[],
//    maxMatchesPerUser: number,
//    event: string,
// ): Tables<"event_schedule">[] {
// }

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

export { assignUsersToTeams };
