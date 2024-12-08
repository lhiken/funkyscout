import { useContext } from "react";
import styles from "./styles.module.css";
import { AssignmentContext } from "../../schedule-context";
import { parseMatchKey } from "../../../../../utils/logic/app";

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
               <div style={{
                     fontFamily: 'Ubuntu Mono',
                     fontSize: "1.1rem",
                     lineHeight: "1.25rem"
               }}>
                  {match.substring(match.indexOf(" "))}
               </div>
            </div>
            <div className={styles.matchTeams}>
               <div className={styles.redTeams}>
                  <Team team={matchData.redTeams[0]} />
                  <Team team={matchData.redTeams[1]} />
                  <Team team={matchData.redTeams[2]} />
               </div>
               <div className={styles.blueTeams}>
                  <Team team={matchData.blueTeams[0]} />
                  <Team team={matchData.blueTeams[1]} />
                  <Team team={matchData.blueTeams[2]} />
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

function Team({ team }: {
   team: string;
}) {
   const assignedData = useContext(AssignmentContext);

   return (
      <div
         className={`${styles.teamCard} ${
            assignedData.val?.priorityTeams.includes(team) && styles.priority
         }`}
      >
         {team.substring(3)}
      </div>
   );
}

export default MatchAssignmentCard;
