import { motion } from "motion/react";
import MobileStartScoutingCard from "../components/cards/start-scouting/start-scouting";
import styles from "./scouting-page.module.css";
import MobileScoutingHistoryCard from "../components/cards/scouting-history/start-scouting";
import { MobileNextMatchCard } from "../components/cards/next-match/next-match";

export default function MobileScoutingPage() {
   return (
      <motion.div
         className={styles.container}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ type: "spring", duration: 0.5 }}
      >
         <MobileNextMatchCard />
         <MobileStartScoutingCard />
         <MobileScoutingHistoryCard />
      </motion.div>
   );
}
