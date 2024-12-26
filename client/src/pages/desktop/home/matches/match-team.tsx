import { useContext } from "react";
import styles from "./styles.module.css";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";

function MatchTeamInfo({
   team,
}: { team: string }) {
   const teamEPAs = useContext(GlobalTeamDataContext).EPAdata;

   return (
      <div className={styles.allianceTeam}>
         {team}
         <div style={{ color: "var(--text-secondary)" }}>
            {teamEPAs["frc" + team] != null
               ? teamEPAs["frc" + team].epa.total_points.mean.toFixed(1)
               : "N/A"}
         </div>
      </div>
   );
}

export default MatchTeamInfo;
