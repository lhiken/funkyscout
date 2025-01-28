import styles from "./styles.module.css";

export default function MobileStartMatchScouting() {
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
         <div className={styles.notice}>
            Remember to lock screen orientation or turn off auto-rotate before
            scouting
         </div>
      </div>
   );
}
