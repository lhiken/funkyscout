import { useEffect, useState } from "react";
import styles from "./compare-content.module.css";
import {
   fetchMatchDataByEvent,
   fetchSpecificTeamDataByEvent,
   fetchTeamImage,
} from "../../../../lib/supabase/data";
import { getEvent, parseMatchKey } from "../../../../utils/logic/app";
import { DataParser2025 } from "../../../../schemas/parser";
import { PitData2025 } from "../../../../schemas/defs";
import { Tables } from "../../../../lib/supabase/database.types";
import PicklistLineGraph from "./graphs/line";
import { MetricDescriptions, TeamMetrics } from "../../../../schemas/schema";
import throwNotification from "../../../../components/app/toast/toast";
import Tippy from "@tippyjs/react";

export default function ComparisonContent({ teamKey }: { teamKey: string }) {
   const [teamData, setTeamData] = useState<Tables<"event_team_data">>();
   const pitData = teamData?.data as unknown as PitData2025;
   const [teamImageUrl, setTeamImageUrl] = useState<string>();
   const [parser, setParser] = useState<DataParser2025>();
   const [teamMatches, setTeamMatches] = useState<
      Tables<"event_match_data">[]
   >();
   const [teleAvg, setTeleAvg] = useState(-1);
   const [autoAvg, setAutoAvg] = useState(-1);

   useEffect(() => {
      fetchTeamImage(teamKey || "", getEvent() || "").then((res) => {
         if (res) {
            setTeamImageUrl(res.publicUrl);
         }
      });

      fetchMatchDataByEvent(getEvent() || "").then((res) => {
         if (res) {
            setParser(new DataParser2025(res, teamKey));
            setTeamMatches(res.filter((val) => val.team == teamKey));
         }
      });

      fetchSpecificTeamDataByEvent(teamKey, getEvent() || "").then((res) => {
         if (res) {
            setTeamData(res);
         }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const getAvg = () => {
      const matches =
         teamMatches?.filter((val) => val.team == teamKey).map((val) =>
            val.match
         ) || [];
      let teleAvg = 0;
      let autoAvg = 0;
      for (const match of matches) {
         teleAvg += parser?.getMatchTeamPoints(match, teamKey).tele || 0;
         autoAvg += parser?.getMatchTeamPoints(match, teamKey).auto || 0;
      }

      teleAvg /= matches.length;
      autoAvg /= matches.length;

      return {
         auto: autoAvg,
         tele: teleAvg,
      };
   };

   const [coralL4, setCoralL4] = useState<number>(-1);
   const [coralL3, setCoralL3] = useState<number>(-1);
   const [coralL2, setCoralL2] = useState<number>(-1);
   const [coralL1, setCoralL1] = useState<number>(-1);
   const [, setAlgaeNet] = useState<number>(-1);
   const [, setAlgaeProc] = useState<number>(-1);
   const [comments, setComments] = useState<
      { matchKey: string; comment: string }[]
   >([]);

   useEffect(() => {
      const av = getAvg();
      setTeleAvg(av.tele);
      setAutoAvg(av.auto);

      setCoralL4(
         (parser?.getTeamL4Scored(teamKey)[teamKey] ?? []).reduce(
            (sum, val) => sum + val,
            0,
         ) /
            ((parser?.getTeamL4Scored(teamKey)[teamKey] ?? []).length || 1),
      );

      setCoralL3(
         (parser?.getTeamL3Scored(teamKey)[teamKey] ?? []).reduce(
            (sum, val) => sum + val,
            0,
         ) /
            ((parser?.getTeamL3Scored(teamKey)[teamKey] ?? []).length || 1),
      );

      setCoralL2(
         (parser?.getTeamL2Scored(teamKey)[teamKey] ?? []).reduce(
            (sum, val) => sum + val,
            0,
         ) /
            ((parser?.getTeamL2Scored(teamKey)[teamKey] ?? []).length || 1),
      );

      setCoralL1(
         (parser?.getTeamL1Scored(teamKey)[teamKey] ?? []).reduce(
            (sum, val) => sum + val,
            0,
         ) /
            ((parser?.getTeamL1Scored(teamKey)[teamKey] ?? []).length || 1),
      );

      setAlgaeNet(
         (parser?.getTeamNetScored(teamKey)[teamKey] ?? []).reduce(
            (sum, val) => sum + val,
            0,
         ) /
            ((parser?.getTeamNetScored(teamKey)[teamKey] ?? []).length || 1),
      );

      setAlgaeProc(
         (parser?.getTeamProcessorScored(teamKey)[teamKey] ?? []).reduce(
            (sum, val) => sum + val,
            0,
         ) /
            ((parser?.getTeamProcessorScored(teamKey)[teamKey] ?? []).length ||
               1),
      );

      setComments(parser?.getTeamComments() || []);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [parser]);

   const [graphedValues, setGraphedValues] = useState<number[]>([]);
   const [metricSelected, setMetricSelected] = useState<string>("total");
   const [metricOption, setMetricOption] = useState<string>("total");
   const [isLoading, setIsLoading] = useState<boolean>(false);

   useEffect(() => {
      setValues();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   async function setValues() {
      setIsLoading(true);

      // First set the selected metric immediately
      setMetricSelected(metricOption);

      if (
         metricOption != "total" && metricOption != "auto" &&
         metricOption != "tele" &&
         !MetricDescriptions[2025][metricOption as keyof TeamMetrics[2025]]
      ) {
         throwNotification("error", "No such query key");
         setIsLoading(false);
         return;
      }

      try {
         const matchData = await fetchMatchDataByEvent(getEvent() || "");
         if (!matchData) {
            setIsLoading(false);
            return;
         }

         const parser = new DataParser2025(matchData);
         const currentMetric = metricOption; // Use the current value

         const getMetric = (teamKey: string) => {
            if (
               !MetricDescriptions[2025][
                  currentMetric as keyof TeamMetrics[2025]
               ]
            ) {
               const newArr: number[] = [];
               parser.getParserData().filter((val) => val.team == teamKey)
                  .forEach(
                     (val) => {
                        const vals = parser.getMatchTeamPoints(
                           val.match,
                           teamKey,
                        );

                        if (currentMetric == "tele") newArr.push(vals.tele);
                        else if (currentMetric == "auto") {
                           newArr.push(vals.auto);
                        } else if (currentMetric == "total") {
                           newArr.push(vals.auto + vals.tele);
                        }
                     },
                  );

               return newArr;
            }

            const record = parser.getTeamMetricRecord(
               currentMetric as never,
               teamKey,
            ) as Record<string, number[]>;
            return Object.values(record).flat(); // Flatten all arrays into one
         };

         const metricValues = getMetric(teamKey) || [0];
         setGraphedValues(metricValues);
      } catch (error) {
         console.error("Error fetching data:", error);
         throwNotification("error", "Failed to fetch match data");
      } finally {
         setIsLoading(false);
      }
   }

   return (
      <>
         <div className={styles.container}>
            <ComparisonBox title="Team Information">
               {pitData?.comment
                  ? (
                     <>
                        <div className={styles.teamInfoBox}>
                           <img className={styles.image} src={teamImageUrl}>
                           </img>
                           <div className={styles.abilitiesBox}>
                              <div className={styles.infoHeader}>
                                 Desc. | {teamData?.name}
                              </div>
                              <div className={styles.archetype}>
                                 {pitData.robotArchetype}
                              </div>
                           </div>
                        </div>
                        <div className={styles.abilitiesList}>
                           <div className={styles.abilityCategory}>
                              <div className={styles.abilityHeader}>Algae</div>
                              <div
                                 style={{
                                    color: pitData.canGroundAlgae
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Ground Intake
                              </div>
                              <div
                                 style={{
                                    color: pitData.canReefAlgae
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Reef Intake
                              </div>
                              <div
                                 style={{
                                    color: pitData.canScoreProcessor
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Processor Scoring
                              </div>
                              <div
                                 style={{
                                    color: pitData.canScoreNet
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Net Scoring
                              </div>
                           </div>
                           <div className={styles.abilityCategory}>
                              <div className={styles.abilityHeader}>Coral</div>
                              <div
                                 style={{
                                    color: pitData.canGroundCoral
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Ground Intake
                              </div>
                              <div
                                 style={{
                                    color: pitData.canSourceCoral
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Reef Intake
                              </div>
                              <div className={styles.coralReef}>
                                 <div
                                    style={{
                                       color: pitData.canScoreReef[0]
                                          ? "var(--text-primary)"
                                          : "",
                                    }}
                                 >
                                    L1
                                 </div>
                                 <div
                                    style={{
                                       color: pitData.canScoreReef[1]
                                          ? "var(--text-primary)"
                                          : "",
                                    }}
                                 >
                                    L2
                                 </div>
                                 <div
                                    style={{
                                       color: pitData.canScoreReef[2]
                                          ? "var(--text-primary)"
                                          : "",
                                    }}
                                 >
                                    L3
                                 </div>
                                 <div
                                    style={{
                                       color: pitData.canScoreReef[3]
                                          ? "var(--text-primary)"
                                          : "",
                                    }}
                                 >
                                    L4
                                 </div>
                              </div>
                           </div>
                           <div className={styles.abilityCategory}>
                              <div className={styles.abilityHeader}>
                                 Climbing
                              </div>
                              <div
                                 style={{
                                    color: pitData.canClimbDeep
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Deep Climb
                              </div>
                              <div
                                 style={{
                                    color: pitData.canClimbShallow
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Shallow Climb
                              </div>
                           </div>
                        </div>
                     </>
                  )
                  : (
                     <div className={styles.teamInfoContainer}>
                        <FallbackBox title="No data found" />
                     </div>
                  )}
            </ComparisonBox>{" "}
            <ComparisonBox title="Match Data">
               {teamMatches && teamMatches?.length > 0
                  ? (
                     <>
                        <div className={styles.performanceGraphHeader}>
                           <div>
                              Graph{" "}
                              <input
                                 className={styles.graphInput}
                                 value={metricOption}
                                 placeholder="metric..."
                                 onChange={(e) => {
                                    setMetricOption(e.target.value);
                                 }}
                              />
                           </div>
                           <div
                              className={`${styles.graphButton} ${
                                 isLoading ? styles.loading : ""
                              }`}
                              onClick={setValues}
                           >
                              {isLoading ? "loading..." : "graph"}
                           </div>
                        </div>
                        <div className={styles.metricGraph}>
                           <div className={styles.metricGraphDetails}>
                              <Tippy
                                 content={MetricDescriptions[2025][
                                       metricSelected as keyof TeamMetrics[2025]
                                    ]
                                    ? MetricDescriptions[2025][
                                       metricSelected as keyof TeamMetrics[2025]
                                    ].title
                                    : metricSelected == "auto"
                                    ? "Auto Points"
                                    : metricSelected == "tele"
                                    ? "Teleop Points"
                                    : "Total Points"}
                              >
                                 <div
                                    style={{
                                       whiteSpace: "nowrap",
                                       overflow: "hidden",
                                       textOverflow: "ellipsis",
                                       maxWidth: "6rem",
                                       color: "var(--primary)",
                                    }}
                                 >
                                    {MetricDescriptions[2025][
                                          metricSelected as keyof TeamMetrics[
                                             2025
                                          ]
                                       ]
                                       ? MetricDescriptions[2025][
                                          metricSelected as keyof TeamMetrics[
                                             2025
                                          ]
                                       ].title
                                       : metricSelected == "auto"
                                       ? "Auto Points"
                                       : metricSelected == "tele"
                                       ? "Teleop Points"
                                       : "Total Points"}
                                 </div>
                              </Tippy>

                              <div
                                 style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                 }}
                              >
                                 <div style={{ fontSize: "1rem" }}>Max</div>
                                 <div style={{ fontSize: "1.2rem" }}>
                                    {graphedValues.length > 0
                                       ? Math.max(...graphedValues).toFixed(1)
                                       : "0.0"}
                                 </div>
                              </div>

                              <div
                                 style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                 }}
                              >
                                 <div style={{ fontSize: "1rem" }}>Min</div>
                                 <div style={{ fontSize: "1.2rem" }}>
                                    {graphedValues.length > 0
                                       ? Math.min(...graphedValues).toFixed(1)
                                       : "0.0"}
                                 </div>
                              </div>

                              <div
                                 style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                 }}
                              >
                                 <div style={{ fontSize: "1rem" }}>Avg</div>
                                 <div style={{ fontSize: "1.2rem" }}>
                                    {graphedValues.length > 0
                                       ? (graphedValues.reduce(
                                          (sum, val) => sum + val,
                                          0,
                                       ) / graphedValues.length).toFixed(1)
                                       : "0.0"}
                                 </div>
                              </div>
                           </div>
                           <div
                              style={{
                                 flexGrow: 1,
                                 width: "1rem",
                              }}
                           >
                              <PicklistLineGraph
                                 valueArray={graphedValues}
                                 axisTicks={3}
                              />
                           </div>
                        </div>
                        <div className={styles.commentsBox}>
                           <div className={styles.commentsWrapper}>
                              {comments.map((val, index) => {
                                 return (
                                    <div key={index} className={styles.comment}>
                                       <div style={{ color: "var(--primary)" }}>
                                          {parseMatchKey(val.matchKey, "short")}
                                       </div>
                                       {val.comment}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </>
                  )
                  : (
                     <div className={styles.teamInfoContainer}>
                        <FallbackBox title="No data found" />
                     </div>
                  )}
            </ComparisonBox>
            <ComparisonBox title="Stats Overview">
               <div className={styles.performanceCardContainer}>
                  <div className={styles.perfCard}>
                     Total Avg.
                     <div style={{ fontSize: "1.5rem" }}>
                        {(teleAvg + autoAvg).toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Tele Avg.
                     <div style={{ fontSize: "1.5rem" }}>
                        {teleAvg.toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Auto Avg.
                     <div style={{ fontSize: "1.5rem" }}>
                        {autoAvg.toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Coral Avg.
                     <div style={{ fontSize: "1.5rem" }}>
                        {(coralL4 + coralL3 + coralL2 + coralL1)
                           .toFixed(1)}
                     </div>
                  </div>
               </div>
               <div className={styles.performanceCardContainer}>
                  <div className={styles.perfCard}>
                     Coral L4
                     <div style={{ fontSize: "1.5rem" }}>
                        {coralL4.toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Coral L3
                     <div style={{ fontSize: "1.5rem" }}>
                        {coralL3.toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Coral L2
                     <div style={{ fontSize: "1.5rem" }}>
                        {coralL2.toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Coral L1
                     <div style={{ fontSize: "1.5rem" }}>
                        {coralL1.toFixed(1)}
                     </div>
                  </div>
               </div>
            </ComparisonBox>
         </div>
      </>
   );
}

function ComparisonBox(
   { title, children }: { title: string; children: React.ReactNode },
) {
   const [expanded, setExpanded] = useState(true);

   return (
      <div className={styles.comparisonContainer}>
         <div
            className={styles.sectionHeader}
            onClick={() => setExpanded((prev) => !prev)}
         >
            {title}
            <div className={styles.sectionHeaderIcon}>
               <i
                  className={`fa-solid fa-chevron-${expanded ? "up" : "down"}`}
               />
            </div>
         </div>
         {expanded && children}
      </div>
   );
}

function FallbackBox({ title }: { title: string }) {
   return (
      <div className={styles.fallbackBox}>
         <i className="fa-regular fa-circle-xmark" />&nbsp; {title}
      </div>
   );
}
