import styles from "./styles.module.css";

function PerformancePage() {
   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               &nbsp;Overall Performance
               &nbsp;<i className="fa-duotone fa-solid fa-caret-down"></i>
            </div>
         </div>
      </div>
   );
}

export default PerformancePage;
