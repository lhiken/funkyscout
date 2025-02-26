import { MobileNextMatchCard } from "../components/cards/next-match/next-match";
import { MobileNextTeamMatchCard } from "../components/cards/next-team-match/next-team-match";
import MobileStartScoutingCard from "../components/cards/start-scouting/start-scouting";
import MobileTeamSearchCard from "../components/cards/team-search-card/team-search";
import styles from "./dashboard.module.css";

export default function MobileDashboard() {
   return (
      <div className={styles.container}>
         <MobileNextMatchCard />
         <MobileNextTeamMatchCard />
         <MobileStartScoutingCard />
         <MobileTeamSearchCard />
      </div>
   );
}
