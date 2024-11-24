import { handleError } from "../../utils/errorHandler";
import { Enums } from "./database.types";
import supabase from "./supabase";

type LocalUserData = {
   uid: string;
   email: string;
   name: string;
   role: Enums<"role">;
};

async function loginWithPassword(
   email: string,
   password: string,
) {
   try {
      const { data, error } = await supabase.auth.signInWithPassword({
         email: email,
         password: password,
      });

      if (error) {
         throw new Error(error.message);
      }

      fetchUserDetails();

      return data;
   } catch (error) {
      handleError(error);
      return false;
   }
}

async function signupWithPassword(
   email: string,
   password: string,
   username: string,
) {
   try {
      console.log("trying to sign up");
      // Call the Edge Function to sign up and create the profile
      const { data, error } = await supabase.functions.invoke("createAccount", {
         body: { email: email, password: password, username: username },
      });

      if (error) {
         console.log("uh oh!");
         throw new Error(error.message);
      }

      console.log(data);
      return true;
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
}

async function fetchSession() {
   try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
         throw new Error(error.message);
      }

      return data;
   } catch (error) {
      handleError(error);
   }
}

async function fetchUser() {
   try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
         throw new Error(error.message);
      }

      return data;
   } catch (error) {
      handleError(error);
   }
}

/* Produces a side effect:
 * sets the localstorage for user details to ensure
 * local cache is up to date and enable stale-while-
 * revalidate
 */
async function fetchUserDetails() {
   try {
      const user = await fetchUser();
      const uid = user?.user.id;
      const email = user?.user.email;

      if (uid && email) {
         const { data: user_profiles, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("uid", uid);

         if (error) {
            throw new Error(error.message);
         }

         if (user_profiles) {
            storeLocalUserData({
               uid: uid,
               email: email,
               name: user_profiles[0].name,
               role: user_profiles[0].role,
            });

            return {
               uid: uid,
               email: email,
               name: user_profiles[0].name,
               role: user_profiles[0].role,
            };
         }
      }
   } catch (error) {
      handleError(error);
   }
}

function storeLocalUserData(data: LocalUserData) {
   localStorage.setItem("userData", JSON.stringify(data));
}

function getLocalUserData(): LocalUserData {
   const userData = localStorage.getItem("userData");

   if (userData) {
      const data = JSON.parse(userData);

      return {
         uid: data.uid,
         email: data.email,
         name: data.name,
         role: data.role,
      };
   } else {
      return {
         uid: "",
         email: "",
         name: "",
         role: "user",
      };
   }
}

function getAuthStatus(): boolean {
   if (getLocalUserData()) {
      return true;
   } else {
      return false;
   }
}

async function logout(): Promise<boolean> {
   try {
      const { error } = await supabase.auth.signOut();

      if (error) {
         throw new Error(error.message);
      }

      localStorage.removeItem("userData");

      return true;
   } catch (error) {
      handleError(error);
      return false;
   }
}

export {
   fetchSession,
   fetchUserDetails,
   getAuthStatus,
   getLocalUserData,
   loginWithPassword,
   logout,
   signupWithPassword,
   storeLocalUserData,
};
