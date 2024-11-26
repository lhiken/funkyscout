import { motion } from "motion/react";
import styles from "./user-settings.module.css";
import { getLocalUserData } from "../../../lib/supabase/auth";
import { Dispatch, SetStateAction } from "react";
import InvitationCard from "../../../components/user-settings/invitation-card";
import UsernameChangeCard from "../../../components/user-settings/username-card";

function UserSettings(
   { setShowSettings }: { setShowSettings: Dispatch<SetStateAction<boolean>> },
) {


   return (
      <motion.div
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         exit={{ y: -20, opacity: 0 }}
         transition={{ type: "spring", stiffness: 400, damping: 20 }}
         className={styles.userSettingsContainer}
      >
         <div className={styles.userSettingsHeader}>
            User settings
            <div
               onClick={() => setShowSettings(false)}
               style={{ fontSize: "1.1rem" }}
            >
               <i className="fa-regular fa-circle-xmark" />
            </div>
         </div>
         <div style={{ color: "var(--text-secondary)" }}>
            {getLocalUserData().email}
         </div>
         <div className={styles.seperator} />
         <UsernameChangeCard />
         <div className={styles.seperator} />
         <InvitationCard />
      </motion.div>
   );
}

export default UserSettings;
