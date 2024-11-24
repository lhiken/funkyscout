import { handleError } from "../../utils/errorHandler";
import supabase from "./supabase";

async function fetchEvents() {
   try {
      const { data: event_list, error } = await supabase
         .from("event_list")
         .select("*");

      if (error) {
         throw new Error(error.message)
      }

      return event_list;
   } catch (error) {
      handleError(error);
   }
}

export { fetchEvents };
