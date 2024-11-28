import { handleError } from "../../utils/errorHandler";
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

export { fetchEvents, fetchEventByKey };
