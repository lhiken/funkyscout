import { useContext, useEffect, useMemo, useState } from "react";
import styles from "./epa-chart.module.css";
import {
   TeamDataContext,
   TeamDataProgressContext,
} from "../../../dashboard-team-context";
import { AnimatePresence, motion } from "motion/react";
import { BarDatum, ResponsiveBar } from "@nivo/bar";
import { NivoChartTheme } from "../../../../../../lib/nivo/theme";
import { getFocusTeam } from "../../../../../../utils/logic/app";
import Checkbox from "../../../../../../components/app/buttons/checkbox";

function TeamEPAChart() {
   const rawTeamData = useContext(TeamDataContext);
   const teamFetchProgress = useContext(TeamDataProgressContext);

   const teamData = useMemo(() => {
      if (!rawTeamData) return [];
      return Object.values(rawTeamData).sort(
         (a, b) => a.epa.total_points.mean - b.epa.total_points.mean,
      );
   }, [rawTeamData]);

   interface TeamWithEPA extends BarDatum {
      team: string;
      meanEPA: number;
   }

   const [teamEPAs, setTeamEPAs] = useState<TeamWithEPA[]>([]);
   
   useEffect(() => {
      if (teamData.length > 0) {
         setTeamEPAs(
            teamData.map(({ team, epa }) => ({
               team,
               meanEPA: epa.total_points.mean,
            })),
         );
      }
   }, [teamData]);

   const [showChartSettings, setShowChartSettings] = useState(false);

   const [focusOnOwnTeam, setFocusOnOwnTeam] = useState(true);

   return (
      <div className={styles.container}>
         {teamEPAs.length > 0
            ? (
               <>
                  <div className={styles.chartContainer}>
                     <ResponsiveBar
                        data={teamEPAs}
                        keys={["meanEPA"]}
                        indexBy="team"
                        margin={{ top: 0, right: 0, bottom: 5, left: 22 }}
                        valueScale={{ type: "linear" }}
                        indexScale={{ type: "band", round: true }}
                        colors={(d) =>
                           focusOnOwnTeam
                              ? d.data.team === getFocusTeam()
                                 ? "var(--primary)"
                                 : "#CDA74544"
                              : "var(--primary)"}
                        theme={NivoChartTheme}
                        borderRadius={4}
                        borderColor={{
                           from: "color",
                           modifiers: [
                              [
                                 "darker",
                                 1.6,
                              ],
                           ],
                        }}
                        axisLeft={{
                           tickSize: 4,
                           tickPadding: 3,
                           legend: "",
                           legendPosition: "middle",
                           legendOffset: -40,
                           truncateTickAt: 0,
                        }}
                        axisBottom={null}
                        tooltip={({ index, value, indexValue }) => (
                           <div className={styles.chartTooltip}>
                              <div
                                 style={{
                                    display: "flex",
                                 }}
                              >
                                 <div style={{ color: "var(--primary)" }}>
                                    {indexValue}
                                 </div>&nbsp;<div
                                    style={{ color: "var(--text-background)" }}
                                 >
                                    |
                                 </div>&nbsp;EPA {value.toFixed(1)}
                              </div>
                              <div style={{ color: "var(--text-secondary)" }}>
                                 Rank {teamEPAs.length - index} by EPA
                              </div>
                           </div>
                        )}
                        enableGridX={true}
                        gridXValues={teamEPAs.map(({ team }) => team).filter((
                           _,
                           index,
                        ) => index % 3 === 0)}
                        enableLabel={false}
                        ariaLabel="Team EPAs"
                     />
                  </div>
                  <div className={styles.chartDetails}>
                     <div style={{ color: "var(--primary)" }}>
                        Mean EPAs by Team
                     </div>
                     <div
                        className={styles.chartSettings}
                     >
                        <div
                           className={styles.chartSettingsText}
                           onClick={() =>
                              setShowChartSettings(!showChartSettings)}
                        >
                           Chart Settings&nbsp;&nbsp;<i
                              className={`fa-solid fa-gear ${styles.chartSettingsGear}`}
                           />
                        </div>
                        <AnimatePresence>
                           {showChartSettings && (
                              <motion.div
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                                 transition={{
                                    duration: 0.2,
                                 }}
                                 className={styles.chartSettingsDetails}
                                 onClick={() =>
                                    setFocusOnOwnTeam(!focusOnOwnTeam)}
                              >
                                 <div className={styles.settingsEntry}>
                                    Set focus on {getFocusTeam()}
                                    <Checkbox
                                       enabled={focusOnOwnTeam}
                                    />
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </>
            )
            : (!(teamFetchProgress.errors == teamFetchProgress.fetched && teamFetchProgress.fetched > 4)
               ? (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{
                        duration: 0.2,
                     }}
                     className={styles.loadingBox}
                  >
                     <div className={styles.loadingSpinner} />Loading team data
                     {" "}
                     {`(${
                        ((teamFetchProgress.fetched /
                           (teamFetchProgress.total
                              ? teamFetchProgress.total
                              : 1)) *
                           100).toFixed(1)
                     }%)`}
                  </motion.div>
               )
               : (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{
                        duration: 0.2,
                     }}
                     className={styles.loadingBox}
                  >
                     Couldn't load team data
                  </motion.div>
               ))}
      </div>
   );
}

export default TeamEPAChart;
