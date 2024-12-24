import { useContext, useState } from "react";
import styles from "./styles.module.css";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";
import { parseMatchKey } from "../../../../../utils/logic/app";
import { AnimatePresence, motion } from "motion/react";

function MatchAssignmentCard({
   matchData,
}: {
   matchData: {
      redTeams: string[];
      blueTeams: string[];
      match: string;
      est_time: number;
   };
}) {
   const match = parseMatchKey(matchData.match, "short");

   return (
      <div className={styles.matchCard}>
         <div className={styles.matchInfo}>
            <div className={styles.matchTitle}>
               {match.substring(0, match.indexOf(" "))}
               <div
                  style={{
                     fontFamily: "Ubuntu Mono",
                     fontSize: "1.1rem",
                     lineHeight: "1.25rem",
                  }}
               >
                  {match.substring(match.indexOf(" "))}
               </div>
            </div>
            <div className={styles.matchTeams}>
               <div className={styles.redTeams}>
                  <Team
                     team={matchData.redTeams[0]}
                     matchKey={matchData.match}
                  />
                  <Team
                     team={matchData.redTeams[1]}
                     matchKey={matchData.match}
                  />
                  <Team
                     team={matchData.redTeams[2]}
                     matchKey={matchData.match}
                  />
               </div>
               <div className={styles.blueTeams}>
                  <Team
                     team={matchData.blueTeams[0]}
                     matchKey={matchData.match}
                  />
                  <Team
                     team={matchData.blueTeams[1]}
                     matchKey={matchData.match}
                  />
                  <Team
                     team={matchData.blueTeams[2]}
                     matchKey={matchData.match}
                  />
               </div>
            </div>
            <div className={styles.matchTime}>
               {(new Date(matchData.est_time * 1000)).toLocaleTimeString(
                  undefined,
                  {
                     hour12: true,
                     hour: "2-digit",
                     minute: "2-digit",
                     hourCycle: "h12",
                  },
               )}
            </div>
         </div>
      </div>
   );
}

function Team({ team, matchKey }: {
   team: string;
   matchKey: string;
}) {
   const assignedData = useContext(AssignmentContext);
   const scheduleData = useContext(ScheduleContext);
   const [displayData, setDisplayData] = useState(false);

   return (
      <div className={styles.teamCardWrapper}>
         <div
            className={`${styles.teamCard} ${
               assignedData.val?.priorityTeams.includes(team) &&
               styles.priority
            } ${
               assignedData.val?.matchData.filter((val) =>
                  val.match == matchKey
               )
                  .find((val) => val.team == team)?.uid && styles.scouted
            }`}
            onMouseEnter={() => setDisplayData(true)}
            onMouseLeave={() => setDisplayData(false)}
         >
            {team.substring(3)}
         </div>
         <AnimatePresence>
            {displayData &&
               (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{
                        duration: 0.1,
                     }}
                     className={styles.teamTooltip}
                  >
                     Assigned to: {scheduleData.val?.userData
                        ? scheduleData.val.userData.find((val) =>
                           val.uid ==
                              assignedData.val?.matchData.filter((
                                 val,
                              ) => val.match == matchKey).find((
                                 val,
                              ) => val.team == team)?.uid
                        )?.name || "N/A"
                        : "N/A"}
                  </motion.div>
               )}
         </AnimatePresence>
      </div>
   );
}

export default MatchAssignmentCard;
