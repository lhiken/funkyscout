import { useContext, useState } from "react";
import { TeamRank } from "../../../../../lib/tba/events";
import styles from "./styles.module.css";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";
import { AnimatePresence, motion } from "motion/react";

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

   const [showDetails, setShowDetails] = useState(false);

   return (
      <div
         className={styles.teamCard}
         onMouseEnter={() => setShowDetails(true)}
         onMouseLeave={() => setShowDetails(false)}
         onClick={handleStarClick}
      >
         <div className={styles.teamInfo}>
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
                     (val.team == teamData.key) && val.uid
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
                     assignmentData.val?.priorityTeams.includes(
                           teamData.key,
                        )
                        ? styles.active
                        : styles.inactive
                  }`}
               >
                  <i className="fa-solid fa-star" />
               </div>
            </div>
         </div>
         <AnimatePresence>
            {showDetails &&
               (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "2rem", opacity: 1 }}
                     exit={{ height: 0, opacity: 0, y: -20 }}
                     transition={{
                        duration: 0.2,
                     }}
                     className={styles.teamDetails}
                  >
                     Scouter
                     <div className={styles.dropdown}>
                        {assignmentData.val?.scouterList.find((val) =>
                           val.uid ==
                              assignmentData.val?.teamData.find((
                                 val,
                              ) => val.team == teamData.key)?.assigned
                        )?.name || "N/A"}
                     </div>
                  </motion.div>
               )}
         </AnimatePresence>
      </div>
   );
}

export default TeamAssignmentCard;
