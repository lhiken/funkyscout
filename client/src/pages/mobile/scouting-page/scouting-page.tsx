import { motion } from "motion/react";
import MobileStartScoutingCard from "../components/cards/start-scouting/start-scouting";
import styles from "./scouting-page.module.css";
import { useState } from "react";

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
