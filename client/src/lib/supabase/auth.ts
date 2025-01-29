import throwNotification from "../../components/app/toast/toast";
import {
   setComparedTeams,
   setCurrentPicklist,
   setUsedMetrics,
} from "../../pages/desktop/picklists/picklist-state-handler";
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
      const { error } = await supabase.functions.invoke("createAccount", {
         body: { email: email, password: password, username: username },
      });

      if (error) {
         throw new Error(error.message);
      }

      return true;
   } catch (error) {
      handleError(error);
      return false;
   }
}

//sends email
async function sendEmail(email: string) {
   try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
         redirectTo: "https://funkyscout.vercel.app/reset-page-link",
      });

      if (error) {
         throw new Error(error.message);
      }
   } catch (error) {
      throwNotification("error", "This email is not valid. Please try again");
      handleError(error);
   }
}

//Updates the user's password
async function updatePass(nPassword: string) {
   try {
      const { data, error } = await supabase.auth.updateUser({
         password: nPassword,
      });

      if (error) {
         throw new Error(error.message);
      }

      if (data) {
         throwNotification("success", "The password is now updated");
      }
   } catch (error) {
      throwNotification("error", "The password is not valid");
      handleError(error);
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

async function logout() {
   try {
      localStorage.removeItem("userData");
      localStorage.removeItem("event");

      setCurrentPicklist(undefined);
      setComparedTeams(undefined);
      setUsedMetrics([]);

      const { error } = await supabase.auth.signOut();

      if (error) {
         throw new Error(error.message);
      }

      return true;
   } catch (error) {
      handleError(error);
      return false;
   }
}

async function applyInviteCode(code: string) {
   try {
      const { error } = await supabase.functions.invoke("useInviteCode", {
         body: { userID: getLocalUserData().uid, inviteCode: code },
      });

      if (error) {
         throw new Error(error.message);
      }

      fetchUserDetails();

      return true;
   } catch (error) {
      handleError(error);
      return false;
   }
}

async function changeName(name: string, userID: string) {
   try {
      const { error } = await supabase.functions.invoke("changeName", {
         body: { userID: userID ? userID : "", name: name },
      });

      if (error) {
         throw new Error(error.message);
      }

      fetchUserDetails();

      return true;
   } catch (error) {
      handleError(error);
      return false;
   }
}

export {
   applyInviteCode,
   changeName,
   fetchSession,
   fetchUserDetails,
   getAuthStatus,
   getLocalUserData,
   loginWithPassword,
   logout,
   sendEmail,
   signupWithPassword,
   storeLocalUserData,
   updatePass,
};
