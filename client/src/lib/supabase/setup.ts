import { handleError } from "../../utils/errorHandler";
import { fetchTBAEventTeams } from "../tba/events";
import supabase from "./supabase";

async function setupEventTeamList(event: string) {
   const teams = await fetchTBAEventTeams(event);

   if (!teams) {
      return;
   }

   let attempts = 0;
   let successes = 0;

   for (const team of teams) {
      attempts++;

      try {
         const { data, error } = await supabase
            .from("event_team_data")
            .insert([
               { event: event, team: team.key },
            ])
            .select();

         if (error) {
            throw new Error(error.message);
         }

         if (data) {
            successes++;
         }
      } catch (error) {
         handleError(error);
      }
   }

   return {
      attempts: attempts,
      successes: successes,
   };
}

export { setupEventTeamList };
