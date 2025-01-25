import styles from "./topbar.module.css";
import { getLocalUserData } from "../../../../lib/supabase/auth";

export default function MobileTopbar({ text }: { text: string }) {
   return (
      <div className={styles.container}>
         <div className={styles.headerText}>
            {text}
         </div>
         <div className={styles.controlButtons}>
            <div className={styles.permissionBreadcrumb}>
               {getLocalUserData().role[0].toUpperCase() + getLocalUserData().role.substring(1)}
            </div>
            <div className={styles.settingsIcon}>
               <i className="fa-solid fa-user-large"/>
            </div>
            <div className={styles.settingsIcon}>
               <i className="fa-solid fa-gear"/>
            </div>
         </div>
      </div>
   );
}
