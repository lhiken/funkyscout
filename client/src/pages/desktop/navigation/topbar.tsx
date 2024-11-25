import { useLocation } from "wouter";
import { getLocalUserData } from "../../../lib/supabase/auth";
import styles from "./topbar.module.css";

function convertPath(path: string) {
   return (
      <>
         {path.substring(1).split("/").map((part, index, arr) => (
            <>
               {part.charAt(0).toUpperCase() + part.substring(1)}
               {index < arr.length - 1 && (
                  <div style={{ color: "var(--text-background)" }}>/</div>
               )}
            </>
         ))}
      </>
   );
}

function Topbar() {
   const user = getLocalUserData();
   const event = localStorage.getItem("event");

   const path = useLocation()[0];

   return (
      <>
         <div className={styles.topbar}>
            <div className={styles.path}>
               Dashboard
               <div style={{ color: "var(--text-background)" }}>/</div>
               <div className={styles.eventBreadcrumb}>{event}</div>
               <div style={{ color: "var(--text-background)" }}>/</div>
               {path == "/" ? "Home" : convertPath(path)}
            </div>
            <div className={styles.user}>
               <div>{user.name}</div>
               <div className={styles.userBreadcrumb}>
                  {user.role.charAt(0).toUpperCase() + user.role.substring(1)}
               </div>
            </div>
         </div>
         <div className={styles.topbarSeperator} />
      </>
   );
}

export default Topbar;
