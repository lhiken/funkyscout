import { useLocation } from "wouter";
import { handleEventChange } from "../../../utils/logic/app";
import styles from "./selector.module.css";
import isMobile from "../../../utils/device";

function EventCard({
   event,
   alias,
   date,
}: { event: string; alias: string; date: string }) {
   const [, navigate] = useLocation();

   function convertDate(date: string) {
      const [, month, day] = date.split("-");
      return `${Number(month)}/${Number(day)}`;
   }

   function handleCardClick () {
      setTimeout(() => {
         handleEventChange(event);
         if (isMobile()) {
            navigate("/dashboard");
         } else {
            navigate("/dashboard");
         }
      }, 200)
   }

   return (
      <button className={styles.eventCard} onClick={handleCardClick}>
         <div className={styles.eventHeader}>
            <div>
               {alias.length > 20 ? alias.slice(0, 20) + "..." : alias}
            </div>
            <div style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
               {convertDate(date)}
            </div>
         </div>
         <div className={styles.eventDetails}>
            <div>
               {`${event}`}
            </div>
            <div className={styles.icon}>
               <i className="fa-solid fa-caret-right" />
            </div>
         </div>
      </button>
   );
}

export default EventCard;
