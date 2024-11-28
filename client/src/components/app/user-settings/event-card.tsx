import styles from "./styles.module.css";

function EventInfoCard({
   event,
   alias,
   date,
}: { event: string; alias: string; date: string }) {
   function convertDate(date: string) {
      const [, month, day] = date.split("-");
      return `${Number(month)}/${Number(day)}`;
   }

   return (
      <button className={styles.eventCard}>
         <div className={styles.eventHeader}>
            <div>
               {alias.length > 20 ? alias.slice(0, 20) + "..." : alias}
            </div>
         </div>
         <div className={styles.eventDetails}>
            <div>
               {`${event}`}
            </div>
            <div>
               {convertDate(date)}
            </div>
         </div>
      </button>
   );
}

export default EventInfoCard;
