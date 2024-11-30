import { useContext, useEffect, useState } from "react";
import { teamRank } from "../../../../lib/tba/events";
import { AnimatePresence, motion } from "motion/react";
import styles from "./ranking.module.css";
import { TeamDataContext } from "../dashboard-team-context";

function RankingCard({
   team,
}: { team: teamRank }) {
   const [showDetails, setShowDetails] = useState(false);
   const [EPA, setEPA] = useState<number>(0);

   const teamEPAs = useContext(TeamDataContext);

   useEffect(() => {
      setEPA(
         teamEPAs[team.key] != null
            ? teamEPAs[team.key].epa.total_points.mean
            : 0,
      );
   }, [teamEPAs, team.key]);

   return (
      <div
         onMouseEnter={() => setShowDetails(true)}
         onMouseLeave={() => setShowDetails(false)}
      >
         <div className={styles.card}>
            <div className={styles.cardLeft}>
               <div className={styles.cardRank}>
                  #{team.rank.toString().padStart(2, "0")}
               </div>
               <div style={{ color: "var(--text-background)" }}>
                  |
               </div>&nbsp;
               <div className={styles.cardName}>
                  {team.name}
               </div>
            </div>
            <div className={styles.cardTeamNumber}>
               {team.team}
            </div>
         </div>
         <AnimatePresence>
            {showDetails &&
               (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "6.25rem", opacity: 1 }}
                     exit={{ height: 0, opacity: 0, y: -20 }}
                     transition={{
                        duration: 0.2,
                     }}
                     className={styles.details}
                  >
                     <div
                        className={styles.seperator}
                        style={{ marginBottom: "0.25rem" }}
                     />
                     <div className={styles.detailsRow}>
                        Team EPA
                        <div>
                           {teamEPAs ? EPA.toFixed(1) : "N/A"}
                        </div>
                     </div>
                     <div className={styles.detailsRow}>
                        Quals Played
                        <div>
                           {team.matches}
                        </div>
                     </div>
                     <div className={styles.detailsRow}>
                        Quals W-T-L
                        <div>
                           {team.record.wins}-{team.record.ties}-{team.record
                              .losses}
                        </div>
                     </div>
                  </motion.div>
               )}
         </AnimatePresence>
      </div>
   );
}

export default RankingCard;
