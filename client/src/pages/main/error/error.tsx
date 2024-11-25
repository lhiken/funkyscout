import { useLocation } from "wouter";
import styles from "./error.module.css";
import { CSSProperties } from "react";

function ErrorPage({ style }: { style?: CSSProperties }) {
   const [, setLocation] = useLocation();

   return (
      <div className={styles.container} style={style}>
         <div className={styles.header}>
            Error 404
         </div>
         <div className={styles.text}>
            Requested page not found
         </div>
         <button
            className={styles.button}
            style={{ marginTop: "1rem" }}
            onClick={() => setLocation("/")}
         >
            Return
         </button>
      </div>
   );
}

export default ErrorPage;
