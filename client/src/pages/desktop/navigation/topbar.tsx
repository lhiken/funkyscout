import { useLocation, useRoute } from "wouter";
import { getLocalUserData } from "../../../lib/supabase/auth";
import styles from "./topbar.module.css";
import throwNotification from "../../../components/toast/toast";
import { useState } from "react";
import UserSettings from "./user-settings";
import { AnimatePresence } from "motion/react";

function Path({ path }: { path: string }) {
   const [location, navigate] = useLocation();

   function navigatePath(index: number) {
      const segments = path.substring(1).split("/");
      let targetPath = "/" + segments.slice(0, index + 1).join("/");

      if (targetPath == "/home") {
         targetPath = "/";
      }

      if (location == targetPath) {
         throwNotification("info", "You're already here");
      } else {
         navigate(targetPath);
      }
   }

   return (
      <>
         {path.substring(1).split("/").map((part, index, arr) => (
            <div key={index}>
               <div
                  className={styles.link}
                  onClick={() =>
                     navigatePath(index)}
               >
                  {part.charAt(0).toUpperCase() + part.substring(1)}
               </div>
               {index < arr.length - 1 && (
                  <div style={{ color: "var(--text-background)" }}>
                     /
                  </div>
               )}
            </div>
         ))}
      </>
   );
}

function Topbar() {
   const user = getLocalUserData();
   const event = localStorage.getItem("event");

   const [, navigate] = useLocation();

   const [matchHome] = useRoute("/");

   function handleNavigate(loc: string, match: boolean) {
      if (!match) {
         navigate(`~/dashboard${loc}`);
      } else {
         throwNotification("info", "You're already here!");
      }
   }

   const path = useLocation()[0];

   const [showSettings, setShowSettings] = useState(false);

   return (
      <>
         <div className={styles.topbar}>
            <div className={styles.path}>
               <div
                  className={styles.link}
                  onClick={() => handleNavigate("/", matchHome)}
               >
                  Dashboard
               </div>
               <div style={{ color: "var(--text-background)" }}>/</div>
               <div className={styles.eventBreadcrumb}>{event}</div>
               <div style={{ color: "var(--text-background)" }}>/</div>
               {path == "/" ? <Path path={"/home"} /> : <Path path={path} />}
            </div>
            <div
               className={styles.user}
               onClick={() => setShowSettings(!showSettings)}
            >
               <i className="fa-solid fa-caret-down" />
               <div>{user.name}</div>
               <div
                  className={styles.userBreadcrumb}
               >
                  {user.role.charAt(0).toUpperCase() +
                     user.role.substring(1)}
               </div>
            </div>
            <AnimatePresence>
               {showSettings && (
                  <UserSettings setShowSettings={setShowSettings} />
               )}
            </AnimatePresence>
         </div>
         <div className={styles.topbarSeperator} />
      </>
   );
}

export default Topbar;
