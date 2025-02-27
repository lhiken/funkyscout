import { motion } from "motion/react";
import { MobileNextTeamMatchCard } from "../components/cards/next-team-match/next-team-match";
import MobilePicklistCard from "../components/cards/picklist-card/picklist-card";
import MobileTeamSearchCard from "../components/cards/team-search-card/team-search";
import styles from "./data-viewer.module.css";

export default function MobileDataViewer() {
   return (
      <motion.div
         className={styles.container}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ type: "spring", duration: 0.5 }}
      >
         <MobileNextTeamMatchCard />
         <MobilePicklistCard />
         <MobileTeamSearchCard />
      </motion.div>
   );
}
