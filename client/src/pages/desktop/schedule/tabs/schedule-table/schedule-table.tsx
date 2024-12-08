import { useContext, useState } from "react";
import styles from "./styles.module.css";
import { ScheduleContext } from "../../schedule-context";
import MatchAssignmentCard from "./match-card";

function ScheduleTable() {
   const scheduleData = useContext(ScheduleContext);

   const [matchQuery] = useState();

   const queriedMatches = scheduleData?.val?.matchData
      ? (matchQuery
         ? Object.entries(scheduleData.val.matchData).map(([match, data]) => ({
            match,
            ...data,
         })).filter((match) => match.match == matchQuery)
         : Object.entries(scheduleData.val.matchData).map(([match, data]) => ({
            match,
            ...data,
         }))).filter((match) => match.match.includes("qm")).sort((a, b) =>
            a.est_time - b.est_time
         )
      : [];

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-calendar-day" />&nbsp;&nbsp;Schedule
            </div>
         </div>
         <div className={styles.titles}>
            <div
               style={{
                  width: "5rem",
               }}
            >
               Match
            </div>
            <div
               style={{
                  display: "flex",
                  flexGrow: "1",
                  justifyContent: "center",
                  gap: "1rem",
               }}
            >
               <div
                  style={{
                     width: "100%",
                     textAlign: "center",
                  }}
               >
                  Red Alliance
               </div>
               <div
                  style={{
                     width: "100%",
                     textAlign: "center",
                  }}
               >
                  Blue Alliance
               </div>
            </div>
            <div
               style={{
                  width: "5rem",
                  textAlign: "right",
               }}
            >
               Time
            </div>
         </div>
         <div className={styles.seperator} />
         <div className={styles.matchContainer}>
            {queriedMatches.map((match, index) => {
               return <MatchAssignmentCard key={index} matchData={match} />;
            })}
         </div>
         <div>
         </div>
      </div>
   );
}

export default ScheduleTable;
