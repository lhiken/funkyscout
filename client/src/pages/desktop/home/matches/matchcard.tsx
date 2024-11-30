import { NexusMatch } from "../../../../lib/nexus/events";
import styles from "./styles.module.css";
import MatchTeamInfo from "./match-team";

function MatchCard({ match }: { match: NexusMatch }) {
   return (
      <div className={styles.matchCard}>
         <div className={styles.matchHeader}>
            {match.label}
            <div
               className={styles.statusBreadcrumb}
               style={(match.status == "Now queuing" ||
                     match.status == "On deck")
                  ? {
                     background: "var(--primary)",
                  }
                  : { background: "var(--text-background)", color: "var(--text-secondary)"}}
            >
               {match.status}
            </div>
         </div>
         <div className={styles.seperator} />
         <div className={styles.matchDetails}>
            <div className={styles.matchTime}>
               Queuing{" "}
               <div>
                  {(new Date(match.times.estimatedQueueTime))
                     .toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                     })}
               </div>
            </div>
         </div>
         <div className={styles.seperator} />
         <div className={styles.alliances}>
            <div className={styles.allianceCard}>
               <div
                  style={{
                     marginBottom: "0.25rem",
                     display: "flex",
                     justifyContent: "space-between",
                  }}
               >
                  Blue Teams
                  <div style={{ color: "var(--text-secondary)" }}>
                     EPA
                  </div>
               </div>
               <MatchTeamInfo team={match.blueTeams[0]} />
               <MatchTeamInfo team={match.blueTeams[1]} />
               <MatchTeamInfo team={match.blueTeams[2]} />
            </div>
            <div className={styles.allianceCard}>
               <div
                  style={{
                     marginBottom: "0.25rem",
                     display: "flex",
                     justifyContent: "space-between",
                  }}
               >
                  Red Teams
                  <div style={{ color: "var(--text-secondary)" }}>
                     EPA
                  </div>
               </div>
               <MatchTeamInfo team={match.redTeams[0]} />
               <MatchTeamInfo team={match.redTeams[1]} />
               <MatchTeamInfo team={match.redTeams[2]} />
            </div>
         </div>
      </div>
   );
}

export default MatchCard;
