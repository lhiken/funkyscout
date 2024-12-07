import { useContext } from "react";
import { TeamRank } from "../../../../../lib/tba/events";
import styles from "./styles.module.css";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";

function TeamAssignmentCard({
   teamData,
}: { teamData: TeamRank }) {
   const assignmentData = useContext(AssignmentContext);
   const scheduleData = useContext(ScheduleContext);

   function handleStarClick() {
      if (assignmentData.setVal) {
         assignmentData.setVal((prev) => ({
            ...prev,
            priorityTeams: prev.priorityTeams.includes(teamData.key)
               ? prev.priorityTeams.filter((team) => team !== teamData.key)
               : [...prev.priorityTeams, teamData.key],
         }));
      }
   }

   return (
      <div className={styles.teamCard}>
         <div className={styles.teamInfo} onClick={handleStarClick}>
            <div className={styles.teamTitle}>
               <div
                  style={{
                     fontFamily: "Ubuntu Mono",
                     fontSize: "1.15rem",
                     color: "var(--primary)",
                     lineHeight: "1.25rem",
                  }}
               >
                  {assignmentData.val?.matchData.filter((val) =>
                     val.team == teamData.key
                  ).length}/{Object.entries(
                     scheduleData.val?.matchData || {},
                  ).filter(
                     ([key, { redTeams, blueTeams }]) =>
                        key.includes("qm") &&
                        (redTeams.includes(teamData.key) ||
                           blueTeams.includes(teamData.key)),
                  ).length}
               </div>&nbsp;<div
                  style={{
                     color: "var(--text-background)",
                  }}
               >
                  |
               </div>&nbsp;<div className={styles.teamName}>
                  {teamData.name}
               </div>
            </div>
            <div
               className={styles.teamNumber}
               style={{
                  color: "var(--primary)",
                  fontSize: "1.15rem",
                  fontFamily: "Ubuntu Mono",
               }}
            >
               {teamData.team}
               &nbsp;
               <div
                  className={`${styles.teamStarIcon} ${
                     assignmentData.val?.priorityTeams.includes(teamData.key)
                        ? styles.active
                        : styles.inactive
                  }`}
               >
                  <i className="fa-solid fa-star" />
               </div>
            </div>
         </div>
      </div>
   );
}

export default TeamAssignmentCard;
