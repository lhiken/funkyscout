import styles from "./sidebar.module.css";
import { logout } from "../../../lib/supabase/auth";
import { motion } from "motion/react";
import throwNotification from "../../../components/toast/toast";
import { useLocation, useRoute } from "wouter";

function Sidebar() {
   const [location, navigate] = useLocation();

   function handleLogout() {
      throwNotification("info", "Logging out...", 1000);
      logout().then((res) => {
         if (res) {
            throwNotification("success", "Logged out!", 1500);
         } else {
            throwNotification("error", "An error occurred while logging out.");
         }
         navigate("~/auth");
      });
   }

   const [matchHome] = useRoute("/");
   const [matchSchedule] = useRoute("/schedule/*?");
   const [matchAnalysis] = useRoute("/analysis/*?");
   const [matchPicklist] = useRoute("/picklist/*?");

   function handleNavigate(loc: string, match: boolean) {
      if (!match) {
         navigate(`~${loc}`);
      } else {
         throwNotification("info", "You're already here!");
      }
   }

   console.log(location);

   return (
      <>
         <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{
               duration: 0.2,
            }}
            className={styles.sidebar}
         >
            <div className={styles.sidebarSection}>
               <div className={`${styles.sidebarButton} ${styles.active}`}>
                  <i className="fa-solid fa-binoculars" />
               </div>
               <div
                  className={`${styles.sidebarButton} ${
                     location === "/" ? styles.active : styles.inactive
                  }`}
                  style={{ fontSize: "1.15rem" }}
                  onClick={() => {
                     handleNavigate("/", matchHome);
                  }}
               >
                  <i className="fa-solid fa-house" />
               </div>
               <div className={styles.sidebarChain}>
                  <div
                     className={`${styles.sidebarDiscreteButton} ${
                        location.startsWith("/schedule")
                           ? styles.active
                           : styles.inactive
                     }`}
                     style={{ fontSize: "1.45rem" }}
                     onClick={() => {
                        handleNavigate("/schedule", matchSchedule);
                     }}
                  >
                     <i className="fa-solid fa-calendar-day" />
                  </div>
                  <div
                     className={`${styles.sidebarDiscreteButton} ${
                        location.startsWith("/picklist")
                           ? styles.active
                           : styles.inactive
                     }`}
                     style={{ fontSize: "1.35rem" }}
                     onClick={() => {
                        handleNavigate("/picklist", matchPicklist);
                     }}
                  >
                     <i className="fa-solid fa-scale-balanced" />
                  </div>
                  <div
                     className={`${styles.sidebarDiscreteButton} ${
                        location.startsWith("/analysis")
                           ? styles.active
                           : styles.inactive
                     }`}
                     onClick={() => {
                        handleNavigate("/analysis", matchAnalysis);
                     }}
                  >
                     <i className="fa-solid fa-chart-pie" />
                  </div>
               </div>
            </div>
            <div className={styles.sidebarSection}>
               <div
                  className={styles.sidebarButton}
                  style={{ fontSize: "1.4rem" }}
                  onClick={handleLogout}
               >
                  <i className="fa-solid fa-right-from-bracket" />
               </div>
               <div className={`${styles.sidebarButton} ${styles.active}`}>
                  <i className="fa-solid fa-gear" />
               </div>
            </div>
         </motion.div>
      </>
   );
}

export default Sidebar;
