import { useLocation } from "wouter";
import styles from "./error.module.css";

function ErrorPage() {
   const [, setLocation] = useLocation();

   return (
      <>
         <div className={styles.container}>
            <div className={styles.header}>
               Uh oh!
            </div>
            <div className={styles.text}>
               An error occured.
            </div>
            <button className={styles.button} onClick={() => setLocation("/")}>
               Return
            </button>
         </div>
      </>
   );
}

export default ErrorPage;
