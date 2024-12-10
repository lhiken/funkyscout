import { useContext } from "react";
import styles from "./styles.module.css";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";

function ScouterScheduleCard({
   scouter,
}: {
   scouter: {
      name: string;
      uid: string;
   };
}) {
   const scheduleData = useContext(ScheduleContext);

   const matches = Object.keys(scheduleData.val?.matchData || {})
      .filter((key) => key.includes("qm"))
      .sort(
         (a, b) =>
            Number(a.substring(a.indexOf("qm") + 2)) -
            Number(b.substring(b.indexOf("qm") + 2))
      );

   return (
      <div className={styles.userSchedule}>
         <div className={styles.userMatches}>
            {matches.map((key, index) => {
               const prevMatch = matches[index - 1];
               const nextMatch = matches[index + 1];
               return (
                  <MatchCard
                     key={key}
                     match={key}
                     scouter={scouter}
                     prevMatch={prevMatch}
                     nextMatch={nextMatch}
                  />
               );
            })}
         </div>
      </div>
   );
}

function MatchCard({
   match,
   scouter,
   prevMatch,
   nextMatch,
}: {
   match: string;
   scouter: { name: string; uid: string };
   prevMatch?: string;
   nextMatch?: string;
}) {
   const assignmentData = useContext(AssignmentContext);
   const matchEntry = assignmentData.val?.matchData.filter((m) =>
      m.match === match
   ).find((m) => m.uid === scouter.uid);

   const isPrevBlank =
      !prevMatch ||
      !assignmentData.val?.matchData.some(
         (m) => m.match === prevMatch && m.uid === scouter.uid
      );
   const isNextBlank =
      !nextMatch ||
      !assignmentData.val?.matchData.some(
         (m) => m.match === nextMatch && m.uid === scouter.uid
      );

   return (
      <div
         className={`${styles.matchUserCard} ${
            matchEntry ? styles.enabled : styles.disabled
         } ${isPrevBlank && matchEntry?.team ? styles.start : ""} ${isNextBlank && matchEntry?.team ? styles.end : ""}`}
      >
         {matchEntry?.team.substring(3) ? matchEntry?.team.substring(3) : "N/A"}
      </div>
   );
}

export default ScouterScheduleCard;
