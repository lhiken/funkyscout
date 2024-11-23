import { useState } from "react";
import styles from "./auth.module.css";
import SigninPage from "./sign-in";
import SignupPage from "./sign-up";
import { Tooltip } from "react-tooltip";

enum AuthMode {
  SignIn = "signin",
  SignUp = "signup",
}

function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.SignIn);

  return (
    <>
      <div className={styles.authRoot}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <i className="fa-solid fa-binoculars" />
              &nbsp; Funkyscout
            </div>
            <div
              className="theme-selector"
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
              }}
            >
              <i className="fa-solid fa-circle-half-stroke"></i>
              <Tooltip anchorSelect=".theme-selector" place="top">
                Switch theme
              </Tooltip>
            </div>
          </div>
          <div className={styles.modebox}>
            <button
              className={`${styles.modeButton} ${styles.signinButton} ${
                styles[
                  authMode == AuthMode.SignIn ? "active" : "inactive"
                ]
              }`}
              onClick={() => setAuthMode(AuthMode.SignIn)}
            >
              Sign in
            </button>
            <button
              className={`${styles.modeButton} ${styles.signupButton} ${
                styles[
                  authMode == AuthMode.SignUp ? "active" : "inactive"
                ]
              }`}
              onClick={() => setAuthMode(AuthMode.SignUp)}
            >
              Sign up
            </button>
          </div>
          {authMode == AuthMode.SignIn ? <SigninPage /> : <SignupPage />}
        </div>
      </div>
    </>
  );
}

export default AuthPage;
