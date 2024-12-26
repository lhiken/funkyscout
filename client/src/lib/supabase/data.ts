import { handleError } from "../../utils/errorHandler";
import { Tables } from "./database.types";
import supabase from "./supabase";

async function fetchEvents() {
   try {
      const { data: event_list, error } = await supabase
         .from("event_list")
         .select("*")
         .order("date", { ascending: true });

      if (error) {
         throw new Error(error.message);
      }

      return event_list;
   } catch (error) {
      handleError(error);
   }
}

async function fetchEventByKey(key: string) {
   try {
      const { data: event_list, error } = await supabase
         .from("event_list")
         .select("*")
         .eq("event", key);

      if (error) {
         throw new Error(error.message);
      } else if (event_list.length == 0) {
         throw new Error("No event found");
      }

      return event_list[0];
   } catch (error) {
      handleError(error);
      return false;
   }
}

async function fetchTeamsByEvent(event: string) {
   try {
      const { data: event_list, error } = await supabase
         .from("event_team_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_list;
   } catch (error) {
      handleError(error);
   }
}

async function fetchTeamAssignments(event: string) {
   try {
      const { data: event_team_data, error } = await supabase
         .from("event_team_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_team_data;
   } catch (error) {
      handleError(error);
   }
}

async function fetchMatchAssignments(event: string) {
   try {
      const { data: event_schedule, error } = await supabase
         .from("event_schedule")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_schedule;
   } catch (error) {
      handleError(error);
   }
}

async function fetchPicklists(event: string) {
   try {
      const { data: event_picklist, error } = await supabase
         .from("event_picklist")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_picklist;
   } catch (error) {
      handleError(error);
   }
}

async function updatePicklist(picklist: Tables<"event_picklist">) {
   try {
      const { data: event_picklist, error } = await supabase
         .from("event_picklist")
         .upsert(picklist);

      if (error) {
         throw new Error(error.message);
      }

      return event_picklist;
   } catch (error) {
      handleError(error);
   }
}

async function deletePicklist(picklist: Tables<"event_picklist">) {
   try {
      const { data: event_picklist, error } = await supabase
         .from("event_picklist")
         .delete()
         .eq("event", picklist.event)
         .eq("id", picklist.id)
         .select();

      if (error) {
         throw new Error(error.message);
      }

      return event_picklist;
   } catch (error) {
      handleError(error);
   }
}

async function fetchMatchDataByEvent(event: string) {
   try {
      const { data: event_match_data, error } = await supabase
         .from("event_match_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_match_data;
   } catch (error) {
      handleError(error);
   }
}

async function fetchTeamDataByEvent(event: string) {
   try {
      const { data: event_team_data, error } = await supabase
         .from("event_team_data")
         .select("*")
         .eq("event", event);

      if (error) {
         throw new Error(error.message);
      }

      return event_team_data;
   } catch (error) {
      handleError(error);
   }
}

export {
   deletePicklist,
   fetchEventByKey,
   fetchEvents,
   fetchMatchAssignments,
   fetchMatchDataByEvent,
   fetchPicklists,
   fetchTeamAssignments,
   fetchTeamDataByEvent,
   fetchTeamsByEvent,
   updatePicklist,
};
