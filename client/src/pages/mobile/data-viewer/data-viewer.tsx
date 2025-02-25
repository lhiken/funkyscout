import { MobileNextTeamMatchCard } from "../components/cards/next-team-match/next-team-match";
import styles from "./data-viewer.module.css";

export default function MobileDataViewer() {
   return (
      <div className={styles.container}>
         <MobileNextTeamMatchCard />
      </div>
   );
}
