import styles from "./styles.module.css";

function SetupPanel() {
   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-toolbox" />&nbsp;&nbsp;Event Setup
            </div>
         </div>
      </div>
   );
}

export default SetupPanel;
