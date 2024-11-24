import { useLocation } from "wouter";
import styles from "./error.module.css";

function ErrorPage() {
   const [, setLocation] = useLocation();

   return (
      <>
         <div className={styles.container}>
            <div className={styles.header}>
               Error 404
            </div>
            <div className={styles.text}>
               Page not found...
            </div>
            <button className={styles.button} style={{marginTop: "1rem"}} onClick={() => setLocation("/")}>
               Return
            </button>
         </div>
      </>
   );
}

export default ErrorPage;
