import styles from "./picklist-tab.module.css";

function PicklistTab() {
   return (
      <div className={styles.container}>
         <div className={styles.containerHeader}>
            <div>
               <i className="fa-solid fa-list-ul" />&nbsp; Picklist
            </div>
         </div>
      </div>
   );
}

export default PicklistTab;
