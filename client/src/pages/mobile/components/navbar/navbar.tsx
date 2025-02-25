import styles from "./navbar.module.css";
import { useLocation } from "wouter";

export default function MobileNavbar() {
   const [location, setLocation] = useLocation();

   return (
      <div className={styles.container}>
         <div
            className={`${styles.pageIcon} ${location == "/" && styles.active}`}
            onClick={() => setLocation("/")}
         >
            <i className="fa-solid fa-house" />
         </div>
         <div
            className={`${styles.pageIcon} ${
               location == "/schedule" && styles.active
            }`}
            onClick={() => setLocation("/schedule")}
         >
            <i className="fa-solid fa-bars-staggered" />
         </div>
         <div
            className={`${styles.pageIcon} ${
               location == "/data" && styles.active
            }`}
            onClick={() => setLocation("/data")}
         >
            <i className="fa-solid fa-scale-unbalanced-flip" />
         </div>
         <div
            className={`${styles.pageIcon} ${
               location == "/scout" && styles.active
            }`}
            onClick={() => setLocation("/scout")}
         >
            <i className="fa-solid fa-binoculars" />
         </div>
      </div>
   );
}
