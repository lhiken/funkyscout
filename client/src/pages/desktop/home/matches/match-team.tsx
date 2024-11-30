import { useContext } from "react";
import { TeamDataContext } from "../dashboard-team-context";
import styles from "./styles.module.css";

function MatchTeamInfo({
   team,
}: { team: number }) {
   const teamEPAs = useContext(TeamDataContext);

   return (
      <div className={styles.allianceTeam}>
         {team}
         <div style={{color: "var(--text-secondary)"}}>
            {teamEPAs["frc" + team] != null
               ? teamEPAs["frc" + team].epa.total_points.mean.toFixed(1)
               : "N/A"}
         </div>
      </div>
   );
}

export default MatchTeamInfo;
