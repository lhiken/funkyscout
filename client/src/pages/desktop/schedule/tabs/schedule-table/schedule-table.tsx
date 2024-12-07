import styles from "./styles.module.css";

function ScheduleTable() {

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-calendar-day" />&nbsp;&nbsp;Schedule
            </div>
         </div>
      </div>
   );
}

export default ScheduleTable;
