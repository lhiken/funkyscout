import { useLocation, useRoute } from "wouter";
import { getLocalUserData } from "../../../lib/supabase/auth";
import styles from "./topbar.module.css";
import throwNotification from "../../../components/app/toast/toast";
import { useState } from "react";
import UserSettings from "./user-settings";
import { AnimatePresence } from "motion/react";
import EventInfo from "./event-info";

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
   const [showEventInfo, setShowEventInfo] = useState(false);

   return (
      <>
         <div className={styles.topbar}>
            <div className={`${styles.path} noselect`}>
               <div
                  className={styles.link}
                  onClick={() => handleNavigate("/", matchHome)}
               >
                  Dashboard
               </div>
               <div style={{ color: "var(--text-background)" }}>/</div>
               <div className={styles.eventDropdownContainer}>
                  <div
                     className={styles.eventBreadcrumb}
                     onClick={() => setShowEventInfo(!showEventInfo)}
                  >
                     <i
                        className={`fa-solid fa-caret-${
                           showEventInfo ? "up" : "down"
                        }`}
                     />
                     &nbsp; {event}
                  </div>
                  <AnimatePresence>
                     {showEventInfo && (
                        <EventInfo setShowSettings={setShowEventInfo} />
                     )}
                  </AnimatePresence>
               </div>
               <div style={{ color: "var(--text-background)" }}>/</div>
               {path == "/" ? <Path path={"/home"} /> : <Path path={path} />}
            </div>
            <div
               className={`${styles.user} noselect`}
               onClick={() => setShowSettings(!showSettings)}
            >
               <div>
                  <i
                     className={`fa-solid fa-bars ${styles.icon}`}
                     style={{ fontSize: "0.9rem" }}
                  />
               </div>
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
      </>
   );
}

export default Topbar;
