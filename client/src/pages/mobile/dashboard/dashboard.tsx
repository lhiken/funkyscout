import { motion } from "motion/react";
import { MobileNextMatchCard } from "../components/cards/next-match/next-match";
import { MobileNextTeamMatchCard } from "../components/cards/next-team-match/next-team-match";
import MobileStartScoutingCard from "../components/cards/start-scouting/start-scouting";
import MobileTeamSearchCard from "../components/cards/team-search-card/team-search";
import styles from "./dashboard.module.css";

export default function MobileDashboard() {
   return (
      <motion.div
         className={styles.container}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ type: "spring", duration: 0.5 }}
      >
         <MobileNextMatchCard />
         <MobileNextTeamMatchCard />
         <MobileStartScoutingCard />
         <MobileTeamSearchCard />
      </motion.div>
   );
}
