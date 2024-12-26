import RankingTab from "./ranking/ranking";
import styles from "./home.module.css";
import InfoTab from "./info/info";
import MatchesTab from "./matches/matches";

function DashboardHome() {
   return (
      <div className={styles.container}>
         <div className={styles.rightTab}>
            <InfoTab />
            <MatchesTab />
         </div>
         <RankingTab />
      </div>
   );
}

export default DashboardHome;
