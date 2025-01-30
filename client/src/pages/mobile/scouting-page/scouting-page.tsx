import { motion } from "motion/react";
import MobileStartScoutingCard from "../components/cards/start-scouting/start-scouting";
import styles from "./scouting-page.module.css";
import { useState } from "react";
import MobileScoutingHistoryCard from "../components/cards/scouting-history/start-scouting";

export default function MobileScoutingPage() {
   return (
      <motion.div
         className={styles.container}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ type: "spring", duration: 0.5 }}
      >
         <NextMatchCard />
         <MobileStartScoutingCard />
         <MobileScoutingHistoryCard />
      </motion.div>
   );
}

function NextMatchCard() {
   const [shiftsDone] = useState(19);
   const [shiftsLeft] = useState(12);
   const [timeToBreak] = useState(12);

   return (
      <div className={styles.nextMatchContainer}>
         <div className={styles.nextMatchScoutStats}>
            <ScoutingStatCard value={shiftsDone + ""} title="shifts done" />
            <ScoutingStatCard value={shiftsLeft + ""} title="shifts left" />
            <ScoutingStatCard value={timeToBreak + "m"} title="to break" />
         </div>
         <div className={styles.nextMatchDetails}>
            <div className={styles.nextMatchHeader}>
               Next Match{" "}
               <div style={{ color: "var(--text-secondary)" }}>|</div>{" "}
               <div style={{ color: "var(--primary)" }}>6m</div>
            </div>
            <div className={styles.nextMatchTime}>
               <i
                  style={{
                     color: "var(--surface)",
                     fontSize: "3.25rem",
                  }}
                  className="fa-regular fa-clock"
               />
               12:15
            </div>
            <div className={styles.nextMatchStartScouting}>
               <div style={{ color: "var(--primary)" }}>Qualification 23</div>
               <div style={{ display: "flex" }}>
                  Team 254&nbsp;
                  <div
                     style={{
                        color: "var(--error)",
                        lineHeight: "1.25rem",
                        fontSize: "2rem",
                     }}
                  >
                     •
                  </div>
               </div>
            </div>
            <div className={styles.nextMatchTeamStats}>
               <div className={styles.teamHeader}>
                  254
                  <div style={{ color: "var(--text-background)" }}>|</div>
                  <div style={{ color: "var(--text-primary)" }}>
                     The Cheesy Poofs
                  </div>
               </div>
               <div className={styles.boxBottom}>
                  <div className={styles.stats}>
                     <div className={styles.statLine}>
                        <div style={{ color: "var(--primary)" }}>Rank</div>
                        <div>#13</div>
                     </div>
                     <div className={styles.statLine}>
                        <div style={{ color: "var(--primary)" }}>EPA</div>
                        <div>16.2</div>
                     </div>
                  </div>
                  <i
                     style={{ fontSize: "1.25rem", color: "var(--primary)" }}
                     className="fa-solid fa-magnifying-glass"
                  />
               </div>
            </div>
         </div>
      </div>
   );
}

function ScoutingStatCard({
   value,
   title,
}: {
   value: string;
   title: string;
}) {
   return (
      <div className={styles.scoutingStatCard}>
         <div className={styles.scoutingStatCardValue}>
            <div>{value.match(/\d+/g)?.join("")}</div>
            <div style={{ fontSize: "1.25rem" }}>
               {value.match(/\D+/g)?.join("")}
            </div>
         </div>
         <div className={styles.scoutingStatCardTitle}>
            {title}
         </div>
      </div>
   );
}
