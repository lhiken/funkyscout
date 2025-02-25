import { MobileNextTeamMatchCard } from "../components/cards/next-team-match/next-team-match";
import MobilePicklistCard from "../components/cards/picklist-card/picklist-card";
import MobileTeamSearchCard from "../components/cards/team-search-card/team-search";
import styles from "./data-viewer.module.css";

export default function MobileDataViewer() {
   return (
      <div className={styles.container}>
         <MobileNextTeamMatchCard />
         <MobilePicklistCard />
         <MobileTeamSearchCard />
      </div>
   );
}
