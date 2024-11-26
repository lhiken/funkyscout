import { changeName, getLocalUserData } from "../../lib/supabase/auth";
import { useState } from "react";
import { motion } from "motion/react";
import Tippy from "@tippyjs/react";
import styles from "./styles.module.css"

function UsernameChangeCard() {
   const [name, setName] = useState("");

   const [nameChangeStatus, setNameChangeStatus] = useState("");

   function handleNameChange() {
      if (name && !nameChangeStatus) {
         setNameChangeStatus("changing")
         changeName(name, getLocalUserData().uid).then((res) => {
            if (res) {
               setNameChangeStatus("Changed name!");
            } else {
               setNameChangeStatus("An error occured")
            }
         })
      }
   }

   return (
      <div className={styles.contentContainer}>
         <div className={styles.contentHeader}>
            Change display name
            <div>
               <Tippy content="Your display name will be associated with any collected data and used to assign shifts">
                  <i
                     className="fa-regular fa-circle-question"
                     style={{
                        color: "var(--text-secondary)",
                        fontSize: "1.1rem",
                     }}
                  />
               </Tippy>
            </div>
         </div>
         <div className={styles.inputWrapper}>
            <input
               name="usernameChange"
               type="text"
               value={name}
               onChange={(input) => setName(input.target.value)}
               className={styles.input}
               placeholder={getLocalUserData().name}
               autoComplete="off"
            />
            <button
               className={`${styles.inviteButton} ${
                  nameChangeStatus ? styles.inactive : styles.active
               }`}
               onClick={handleNameChange}
            >
               <i className="fa-solid fa-check" />
            </button>
         </div>
         <div className={styles.usernameSubtext}>
            Please use your real name
         </div>
         {nameChangeStatus && nameChangeStatus != "changing" &&
            (
               <motion.div
                  onClick={() => setNameChangeStatus("")}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{
                     type: "spring",
                     stiffness: 400,
                     damping: 20,
                  }}
                  className={`${styles.inviteInfo} ${
                     nameChangeStatus == "Changed name!"
                        ? styles.success
                        : styles.failure
                  }`}
               >
                  {nameChangeStatus}
                  <i className="fa-solid fa-xmark" />
               </motion.div>
         )}
      </div>
   );
}

export default UsernameChangeCard;