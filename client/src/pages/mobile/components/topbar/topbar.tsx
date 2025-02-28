import styles from "./topbar.module.css";
import { getLocalUserData, logout } from "../../../../lib/supabase/auth";
import { useState } from "react";
import UsernameChangeCard from "../../../../components/app/user-settings/username-card";
import InvitationCard from "../../../../components/app/user-settings/invitation-card";
import throwNotification from "../../../../components/app/toast/toast";
import { navigate } from "wouter/use-browser-location";
import { AnimatePresence, motion } from "motion/react";
import { toggleTheme } from "../../../../utils/theme";
import performReinstallPWA from "../../../../utils/logic/reinstall";

export default function MobileTopbar({ text }: { text: string }) {
   const [showUserSettings, setShowUserSettings] = useState(false);

   return (
      <div className={styles.container}>
         <div className={styles.headerText}>
            {text}
         </div>
         <div className={styles.controlButtons}>
            <div
               className={styles.permissionBreadcrumb}
               onClick={() => setShowUserSettings(true)}
            >
               {getLocalUserData().role[0].toUpperCase() +
                  getLocalUserData().role.substring(1)}
            </div>
            <div
               className={styles.settingsIcon}
               onClick={() => setShowUserSettings(true)}
            >
               <i className="fa-solid fa-gear" />
            </div>
            <div
               className={styles.settingsIcon}
               onClick={toggleTheme}
            >
               <i className="fa-solid fa-moon" />
            </div>
         </div>
         <AnimatePresence>
            {showUserSettings &&
               <UserSettingsM stopShowing={() => setShowUserSettings(false)} />}
         </AnimatePresence>
      </div>
   );
}

function UserSettingsM({
   stopShowing,
}: { stopShowing: () => void }) {
   function handleLogout() {
      logout().then((res) => {
         if (res) {
            throwNotification("success", "Logged out");
         } else {
            throwNotification("error", "An error occured");
         }
         navigate("/auth");
      });
   }

   return (
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -10 }}
         transition={{ duration: 0.2 }}
         className={styles.settingContainer}
      >
         <div className={styles.settingHeaderBox}>
            <div className={styles.settingHeader}>
               User Settings
               <div
                  style={{ fontSize: "1.25rem", lineHeight: "1rem" }}
                  onClick={stopShowing}
               >
                  <i className="fa-solid fa-xmark" />
               </div>
            </div>
            {getLocalUserData().email}
         </div>
         <div className={styles.seperator} />
         <div className={styles.settingsContent}>
            <div
               style={{
                  display: "flex",
                  gap: "1.25rem",
                  flexDirection: "column",
                  color: "var(--text-primary)",
               }}
            >
               <InvitationCard />
               <UsernameChangeCard />
            </div>
            <div
               style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
            >
               <div
                  className={styles.signoutButton}
                  onClick={() => {
                     navigate("/events/new");
                  }}
               >
                  Change Events<i
                     style={{ color: "var(--text-secondary)" }}
                     className="fa-solid fa-calendar"
                  />
               </div>
               <div className={styles.signoutButton} onClick={handleLogout}>
                  Logout<i
                     style={{ color: "var(--text-secondary)" }}
                     className="fa-solid fa-right-from-bracket"
                  />
               </div>
               <div
                  className={styles.signoutButton}
                  style={{
                     color: "var(--text-primary)",
                     borderColor: "var(--red-alliance)",
                  }}
                  onClick={() => {
                     if (navigator.onLine) navigate("/m/setup");
                     else {throwNotification(
                           "error",
                           "You can only reset when there is internet",
                        );}
                  }}
               >
                  Update cache<i
                     style={{ color: "var(--text-secondary)" }}
                     className="fa-solid fa-arrows-rotate"
                  />
               </div>
               <div
                  className={styles.signoutButton}
                  style={{
                     color: "var(--text-primary)",
                     borderColor: "var(--red-alliance)",
                  }}
                  onClick={() => {
                     performReinstallPWA();
                     handleLogout();
                  }}
               >
                  Reinstall App<i
                     style={{ color: "var(--text-secondary)" }}
                     className="fa-solid fa-trash"
                  />
               </div>
            </div>
         </div>
      </motion.div>
   );
}
