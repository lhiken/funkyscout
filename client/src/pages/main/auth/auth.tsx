import { useState } from "react";
import styles from "./auth.module.css";
import SigninPage from "./sign-in";
import SignupPage from "./sign-up";

enum AuthMode {
   SignIn = "signin",
   SignUp = "signup",
}

function AuthPage() {
   const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.SignIn);

   return (
      <>
         <div className={styles.container}>
            <div className={styles.header}>
               <div>
                  <i className="fa-solid fa-binoculars" />
                  &nbsp; Funkyscout
               </div>
               <div className="text-[color:--text-secondary]">
                  <i className="fa-solid fa-book" />
               </div>
            </div>
            <div className={styles.modebox}>
               <button
                  className={`${styles.modeButton} ${styles.signinButton} ${
                     styles[authMode == AuthMode.SignIn ? "active" : "inactive"]
                  }`}
                  onClick={() => setAuthMode(AuthMode.SignIn)}
               >
                  Sign in
               </button>
               <button
                  className={`${styles.modeButton} ${styles.signupButton} ${
                     styles[authMode == AuthMode.SignUp ? "active" : "inactive"]
                  }`}
                  onClick={() => setAuthMode(AuthMode.SignUp)}
               >
                  Sign up
               </button>
            </div>
            {authMode == AuthMode.SignIn ? <SigninPage /> : <SignupPage />}
         </div>
      </>
   );
}

export default AuthPage;
