import { useEffect, useState } from "react";
import { loginWithPassword } from "../../../lib/supabase/auth";
import { useLocation, useRoute } from "wouter";
import { motion } from "motion/react";
import styles from "./mode.module.css";
import throwNotification from "../../../components/toast/toast";

function SigninPage() {
   const [, setLocation] = useLocation();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   function handleLogin() {
      throwNotification("info", "Signing you in...");
      loginWithPassword(email, password).then((res) => {
         if (res) {
            throwNotification(
               "success",
               `Signed in with ${res.user.email}`,
               1000,
            );
            setLocation("/events");
            return true;
         } else {
            throwNotification("error", "Incorrect username or password");
         }
      });
   }

   const [verified] = useRoute("/auth/verify");

   useEffect(() => {
      if (verified) {
         throwNotification(
            "success",
            "Email verified! You may now sign in.",
            2500,
         );
      }
   }, [verified]);

   return (
      <>
         <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{
               duration: 0.2,
            }}
            className={styles.container}
         >
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
         </motion.div>
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
