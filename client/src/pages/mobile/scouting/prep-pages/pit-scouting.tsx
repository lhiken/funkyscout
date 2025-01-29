import styles from "./styles.module.css";

export default function MobileStartPitScouting() {
   return (
      <div className={styles.container}>
         <div className={styles.returnHeader}>
            <div
               className={styles.returnHeaderButton}
               onClick={() => history.back()}
            >
               <div>
                  <i className="fa-solid fa-chevron-left" />
               </div>
               Return
            </div>
            <div className={styles.seperator} />
         </div>
      </div>
   );
}
