import { handleError } from "../../utils/errorHandler";
import supabase from "./supabase";

async function fetchAllUserDetails() {
   try {
      const { data: user_profiles, error } = await supabase
         .from("user_profiles")
         .select("*");

      if (error) {
         throw new Error(error.message);
      } else if (user_profiles.length == 0) {
         throw new Error("No event found");
      }

      return user_profiles;
   } catch (error) {
      handleError(error);
      return false;
   }
}

export { fetchAllUserDetails };
