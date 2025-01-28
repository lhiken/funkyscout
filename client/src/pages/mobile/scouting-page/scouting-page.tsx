import { motion } from "motion/react";
import MobileStartScoutingCard from "../components/cards/start-scouting/start-scouting";
import styles from "./scouting-page.module.css";

export default function MobileScoutingPage() {
   return (
      <motion.div
         className={styles.container}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ type: "spring", duration: 0.5 }}
      >
         <MobileStartScoutingCard />
      </motion.div>
   );
}
