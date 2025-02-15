import styles from "../schedule/schedule.module.css";
import PerformancePage from "./performance";
import Matches from "./matches"
import Team from "./team-list"


function AnalysisPage() {

    return (
            <div className={styles.scheduleContainer}>
                <Team />
                <PerformancePage />
                <Matches />
            </div>

    );

    
}

export default AnalysisPage;