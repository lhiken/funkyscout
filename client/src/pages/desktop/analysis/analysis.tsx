import styles from "../schedule/schedule.module.css";
import PerformancePage from "./performance";
import Team from "./team-list";

function AnalysisPage() {
   return (
      <div className={styles.scheduleContainer}>
         <Team />
         <PerformancePage />
      </div>
   );
}

export default AnalysisPage;
