import styles from "./styles.module.css";

function InfoTab() {
   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-chart-line" />&nbsp;&nbsp;
               Event Information
            </div>
         </div>
      </div>
   );
}

export default InfoTab;
