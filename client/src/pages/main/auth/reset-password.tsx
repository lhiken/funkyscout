import { useEffect, useState } from "react";
//import { loginWithPassword } from "../../../lib/supabase/auth";
import { useLocation, useRoute } from "wouter";
import { motion } from "motion/react";
import styles from "./mode.module.css";
import authStyles from "./auth.module.css";
import throwNotification from "../../../components/app/toast/toast";
//fixed following line - make sure later!!
import supabase from "../../../lib/supabase/supabase"; 
import { updatePass }from "../../../lib/supabase/auth";
import style from "../../desktop/home/info/styles.module.css"


function ResetPassword() {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");


    function handlePassword() {

        if (passwordConfirmation == password){
            updatePass(password);

        } else {
            throwNotification("error", "An error occurred while resetting your password")
        }

    }

    return (
        <>
        <div
            className={authStyles.authRoot}
        >
        <div className={authStyles.container}>
        <div className={styles.header}>
            <i className="fa-solid fa-binoculars" />
            &nbsp; Funkyscout
        </div>
       <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{
             duration: 0.2,
          }}
       >
        
        <div className={styles.container}>
        <div className={styles.inputWrapper}>
            <input
                name="password"
                type="password"
                value={password}
                onChange={(input) => setPassword(input.target.value)}
                className={styles.input}
                placeholder="Password"
                autoComplete="none"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    e.currentTarget
                        .blur();
                    }
                }}
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
                    setPasswordConfirmation(
                    input.target.value,
                    )}
                className={styles.input}
                placeholder="Confirm Password"
                autoComplete="none"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    e.currentTarget
                        .blur();
                    }
                }}
            />
            <span
                className={`${styles.icon} ${
                    (password &&
                        passwordConfirmation ==
                            password)
                    ? styles.correct
                    : passwordConfirmation
                    ? styles.incorrect
                    : styles.inactive
                }`}
            >
                {(password &&
                    passwordConfirmation == password)
                    ? <i className="fa-regular fa-circle-check" />
                    : <i className="fa-regular fa-circle-xmark" />}
            </span>
        </div>
        <div className={styles.buttonContainer}>
            <button
            className={`${authStyles.modeButton} ${authStyles.signipButton} ${
                authStyles[
                    password ? "active" : "inactive"
                ]
                }`}
            onClick={handlePassword}
            >
            Reset Password
            </button>
        </div>
        </div>
       </motion.div>
       </div>
       </div>
       </>
    )
}
 export default ResetPassword;
