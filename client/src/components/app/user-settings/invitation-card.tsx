import { motion } from "motion/react";
import { applyInviteCode } from "../../../lib/supabase/auth";
import { useState } from "react";
import Tippy from "@tippyjs/react";
import styles from "./styles.module.css"

function InvitationCard() {
   const [inviteCode, setInviteCode] = useState("");

   const [invitationStatus, setInvitationStatus] = useState("");

   function handleInvite() {
      if (!invitationStatus) {
         setInvitationStatus("applying");
         applyInviteCode(inviteCode).then((res) => {
            if (res) {
               setInvitationStatus("Code applied!");
            } else {
               setInvitationStatus("Invalid or expired code");
            }
         });
      }
   }

   return (
      <div className={styles.contentContainer}>
         <div className={styles.contentHeader}>
            Use an invite code
            <div>
               <Tippy content="An invite code allows you to receive a higher position like scouter or admin">
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
               name="inviteCode"
               type="text"
               value={inviteCode}
               onChange={(input) => setInviteCode(input.target.value)}
               className={styles.input}
               placeholder="Invite code"
               autoComplete="off"
            />
            <button
               className={`${styles.inviteButton} ${
                  invitationStatus ? styles.inactive : styles.active
               }`}
               onClick={handleInvite}
            >
               <i className="fa-solid fa-check" />
            </button>
         </div>
         {invitationStatus && invitationStatus != "applying" &&
            (
               <motion.div
                  onClick={() => setInvitationStatus("")}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{
                     type: "spring",
                     stiffness: 400,
                     damping: 20,
                  }}
                  className={`${styles.inviteInfo} ${
                     invitationStatus == "Code applied!"
                        ? styles.success
                        : styles.failure
                  }`}
               >
                  {invitationStatus}
                  <i className="fa-solid fa-xmark" />
               </motion.div>
            )}
      </div>
   );
}

export default InvitationCard