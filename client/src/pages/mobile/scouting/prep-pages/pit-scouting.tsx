import styles from "./styles.module.css";

export default function MobileStartPitScouting() {
   return (
      <div className={styles.container}>
         <div className={styles.returnHeader} onClick={() => history.back()}>
            go back
         </div>
      </div>
   );
}
