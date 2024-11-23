import { useState } from "react";
import { loginWithPassword } from "../../../lib/supabase/auth";
import { useLocation } from "wouter";
import styles from "./mode.module.css";
import isMobile from "../../../utils/device";
import throwNotification from "../../../components/toast/toast";

function SigninPage() {
   const [, setLocation] = useLocation();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   function handleLogin() {
      throwNotification("info", "Signing you in...");
      loginWithPassword(email, password).then((res) => {
         if (res) {
            if (isMobile()) {
               setLocation("/m/dashboard/");
            } else {
               setLocation("/dashboard/");
            }
            throwNotification("success", `Signed in with ${res.user.email}`);
            return true;
         } else {
            throwNotification("error", "Incorrect username or password");
         }
      });
   }

   return (
      <>
         <div className={styles.container}>
            <input
               name="email"
               value={email}
               onChange={(input) => setEmail(input.target.value)}
               className={styles.input}
               placeholder="Email"
               autoComplete="email"
            />
            <div className={styles.bottomContainer}>
               <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(input) => setPassword(input.target.value)}
                  className={styles.input}
                  placeholder="Password"
                  autoComplete="off"
               />
               <button
                  className={`${styles.submitButton} ${
                     email && password ? styles.active : styles.inactive
                  }`}
                  onClick={handleLogin}
               >
                  <i className="fa-solid fa-arrow-right" />
               </button>
            </div>
         </div>
         <button
            className={styles.resetButton}
            onClick={() =>
               throwNotification("error", "That's pretty unfortunate")}
         >
            Forgot password?
         </button>
      </>
   );
}

export default SigninPage;
