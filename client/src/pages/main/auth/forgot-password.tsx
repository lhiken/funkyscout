import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "motion/react";
import styles from "./mode.module.css";
import authStyles from "./auth.module.css";

import throwNotification from "../../../components/app/toast/toast";
import { sendEmail } from "../../../lib/supabase/auth";


function ForgotPassword() {
  const [email, setEmail] = useState("");
 
  const [verified] = useRoute("/auth/verify");

  function handleEmail() {
    
    if (!verified)
    {
        throwNotification("error", "Email is not valid");
    }
    
    else {
        sendEmail(email);
    }
        
  }

  return (
    
    <>
    <div
            className={authStyles.authRoot}
        >
        <div className={authStyles.container}>
        <div className={styles.header}>
            <i className="fa-solid fa-binoculars"/>
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

        <input
            name="email"
            value={email}
            onChange={(input) => setEmail(input.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
            }}
            className={styles.input}
            placeholder="Email"
            autoComplete="email"
        />
        <div className={styles.buttonContainer}>
                <button
                className={`${authStyles.modeButton} ${authStyles.signipButton} ${
                    authStyles[
                       email ? "active" : "inactive"
                    ]
                 }`}
                onClick={handleEmail}
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

export default ForgotPassword;





