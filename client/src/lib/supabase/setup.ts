import { handleError } from "../../utils/errorHandler";
import { fetchTBAEventTeams } from "../tba/events";
import { Tables } from "./database.types";
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

async function uploadTeamAssignments(
   data: Tables<"event_team_data">[],
) {
   const prunedData = data.map((val) => ({
      event: val.event,
      team: val.team,
      assigned: val.assigned,
      uid: null,
   }));

   try {
      const { data, error } = await supabase
         .from("event_team_data")
         .upsert(prunedData)
         .select();

      if (error) {
         throw new Error(error.message);
      }

      return data;
   } catch (error) {
      handleError(error);
      return false;
   }
}

async function uploadMatchAssignments(
   data: Tables<"event_schedule">[],
) {
   const prunedData = data.map((val) => ({
      event: val.event,
      team: val.team,
      match: val.match,
      name: val.name,
      uid: val.uid,
      alliance: val.alliance,
   }));

   try {
      const { data, error } = await supabase
         .from("event_schedule")
         .upsert(prunedData)
         .select();

      if (error) {
         throw new Error(error.message);
      }

      return data;
   } catch (error) {
      handleError(error);
      return false;
   }
}

export { setupEventTeamList, uploadMatchAssignments, uploadTeamAssignments };
