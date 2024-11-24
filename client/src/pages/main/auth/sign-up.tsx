import { useState } from "react";
import styles from "./mode.module.css";
import authStyles from "./auth.module.css";
import { signupWithPassword } from "../../../lib/supabase/auth";
import throwNotification from "../../../components/toast/toast";

function SignupPage() {
   const [passwordMode, setPasswordMode] = useState(false);
   const [showVerification, setShowVerification] = useState(false);

   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");

   const [password, setPassword] = useState("");
   const [passwordConfirmation, setPasswordConfirmation] = useState("");

   function handleProgress(direction: number) {
      if (username && email && direction == 1 && !passwordMode) {
         setPasswordMode(true);
      } else if (
         password && passwordConfirmation && password == passwordConfirmation &&
         password.length >= 6 &&
         direction == 1
      ) {
         throwNotification("info", "Signing up...");
         signupWithPassword(email, password, username).then((res) => {
            if (res) {
               setShowVerification(true);
               throwNotification("success", "Successfully created account!");
            } else {
               throwNotification(
                  "error",
                  "An error occured creating your account",
               );
            }
         });
      } else if (direction == -1) {
         setPasswordMode(false);
      }
   }

   return (
      <>
         <div
            className={styles.container}
         >
            {!passwordMode
               ? (
                  <>
                     <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(input) => setEmail(input.target.value)}
                        className={styles.input}
                        placeholder="Email"
                        autoComplete="email"
                     />
                     <input
                        name="username"
                        type="name"
                        value={username}
                        onChange={(input) => setUsername(input.target.value)}
                        className={styles.input}
                        placeholder="Name"
                        autoComplete="name"
                     />
                  </>
               )
               : (
                  <>
                     <div className={styles.inputWrapper}>
                        <input
                           name="password"
                           type="password"
                           value={password}
                           onChange={(input) => setPassword(input.target.value)}
                           className={styles.input}
                           placeholder="Password (6+ chars)"
                           autoComplete="none"
                        />
                        <span
                           className={`${styles.icon} ${
                              (password && password.length >= 6)
                                 ? styles.correct
                                 : password
                                 ? styles.incorrect
                                 : styles.inactive
                           }`}
                        >
                           {(password && password.length >= 6)
                              ? <i className="fa-regular fa-circle-check" />
                              : <i className="fa-regular fa-circle-xmark" />}
                        </span>
                     </div>
                     <div className={styles.inputWrapper}>
                        <input
                           name="passwordConfirmation"
                           type="password"
                           value={passwordConfirmation}
                           onChange={(input) =>
                              setPasswordConfirmation(input.target.value)}
                           className={styles.input}
                           placeholder="Confirm Password"
                           autoComplete="none"
                        />
                        <span
                           className={`${styles.icon} ${
                              (password && passwordConfirmation == password)
                                 ? styles.correct
                                 : passwordConfirmation
                                 ? styles.incorrect
                                 : styles.inactive
                           }`}
                        >
                           {(password && passwordConfirmation == password)
                              ? <i className="fa-regular fa-circle-check" />
                              : <i className="fa-regular fa-circle-xmark" />}
                        </span>
                     </div>
                  </>
               )}
            <div className={authStyles.modebox}>
               {!showVerification
                  ? (
                     <>
                        <button
                           className={`${authStyles.modeButton} ${authStyles.signipButton} ${
                              authStyles[
                                 passwordMode ? "active" : "inactive"
                              ]
                           }`}
                           style={{
                              borderRight: `1.5px solid ${
                                 passwordMode && password &&
                                    passwordConfirmation &&
                                    password == passwordConfirmation &&
                                    password.length >= 6
                                    ? "var(--inset)"
                                    : "var(--surface)"
                              }`,
                           }}
                           onClick={() => handleProgress(-1)}
                        >
                           Back
                        </button>
                        <button
                           className={`${authStyles.modeButton} ${authStyles.signupButton} ${
                              authStyles[
                                 (password && passwordConfirmation &&
                                       password == passwordConfirmation &&
                                       passwordMode && password.length >= 6) ||
                                    (username && email && !passwordMode)
                                    ? "active"
                                    : "inactive"
                              ]
                           }`}
                           style={{
                              borderLeft: `1.5px solid ${
                                 passwordMode && password &&
                                    passwordConfirmation &&
                                    password == passwordConfirmation &&
                                    password.length >= 6
                                    ? "var(--inset)"
                                    : "var(--surface)"
                              }`,
                           }}
                           onClick={() => handleProgress(1)}
                        >
                           Next
                        </button>
                     </>
                  )
                  : (
                     <div style={{
                        margin: "1rem"
                     }}>
                        Please check your inbox and verify your account!
                     </div>
                  )}
            </div>
         </div>
      </>
   );
}

export default SignupPage;
