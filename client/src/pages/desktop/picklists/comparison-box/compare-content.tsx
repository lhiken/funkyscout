import { useContext, useEffect, useRef, useState } from "react";
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
import {
   MatchMetrics,
   MetricDescriptions,
   TeamMetrics,
} from "../../../../schemas/schema";
import throwNotification from "../../../../components/app/toast/toast";
import Tippy from "@tippyjs/react";
import MatchReplayFieldMap from "./graphs/display";
import {
   Listbox,
   ListboxButton,
   ListboxOption,
   ListboxOptions,
} from "@headlessui/react";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";

const UniversalDropdown: React.FC<{
   options: { key: string; title: string }[];
   value: string;
   onChange: (key: string) => void;
   className?: string;
}> = ({ options, value, onChange, className }) => {
   // Ensure options array is not empty
   const safeOptions = options.length > 0
      ? options
      : [{ key: "", title: "No options" }];

   const selectedOption = safeOptions.find((option) => option.key === value) ||
      safeOptions[0];

   return (
      <Listbox value={value} onChange={onChange}>
         {({ open }) => (
            <div className={`${styles.dropdownContainer} ${className || ""}`}>
               <ListboxButton className={styles.graphInput}>
                  <i
                     className={`${styles.chevron} fa-solid ${
                        open ? "fa-chevron-up" : "fa-chevron-down"
                     }`}
                  />
                  <span className={styles.buttonText}>
                     {selectedOption?.title || "Select option"}
                  </span>
               </ListboxButton>
               <ListboxOptions className={styles.options}>
                  {safeOptions.map((option) => (
                     <ListboxOption
                        key={option.key}
                        value={option.key}
                        className={styles.option}
                     >
                        {({ selected, active }) => (
                           <div
                              className={`${styles.optionText} ${
                                 active ? styles.activeOption : ""
                              } ${selected ? styles.selectedOption : ""}`}
                           >
                              {option.title}
                           </div>
                        )}
                     </ListboxOption>
                  ))}
               </ListboxOptions>
            </div>
         )}
      </Listbox>
   );
};

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
   const [coralL4, setCoralL4] = useState<number>(-1);
   const [coralL3, setCoralL3] = useState<number>(-1);
   const [coralL2, setCoralL2] = useState<number>(-1);
   const [coralL1, setCoralL1] = useState<number>(-1);
   const [, setAlgaeNet] = useState<number>(-1);
   const [, setAlgaeProc] = useState<number>(-1);
   const [comments, setComments] = useState<
      { matchKey: string; comment: string; author: string }[]
   >([]);
   const [graphedValues, setGraphedValues] = useState<
      { matchKey: string; value: number }[]
   >([]);
   const [metricOption, setMetricOption] = useState<string>("total");
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const latestRequestIdRef = useRef<number>(0);

   const globData = useContext(GlobalTeamDataContext);

   // Prepare dropdown options: defaults plus any extra keys from MetricDescriptions
   const defaultMetrics = [
      { key: "total", title: "Total Points" },
      { key: "auto", title: "Auto Points" },
      { key: "tele", title: "Teleop Points" },
   ];

   const extraMetrics = Object.keys(MetricDescriptions[2025] || {})
      .filter((key) => !defaultMetrics.some((metric) => metric.key === key))
      .map((key) => ({
         key,
         title:
            MetricDescriptions[2025][key as keyof TeamMetrics[2025]]?.title ||
            key,
      }));

   const allMetrics = [...defaultMetrics, ...extraMetrics];

   // Initial data fetch
   useEffect(() => {
      fetchTeamImage(teamKey || "", getEvent() || "").then((res) => {
         if (res) {
            setTeamImageUrl(res.publicUrl);
         }
      });

      fetchMatchDataByEvent(getEvent() || "").then((res) => {
         if (res) {
            setParser(new DataParser2025(res, teamKey));
            const teamMatches = res.filter((val) => val.team === teamKey).sort(
               (a, b) => {
                  const getMatchNumber = (key: string) =>
                     parseInt(key.split("_")[1].replace(/\D/g, ""), 10);
                  return getMatchNumber(a.match) - getMatchNumber(b.match);
               },
            );
            setTeamMatches(teamMatches);
            setCurrentReplay(teamMatches[0]);
         }
      });

      fetchSpecificTeamDataByEvent(teamKey, getEvent() || "").then((res) => {
         if (res) {
            setTeamData(res);
         }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   // Calculate averages and coral scores whenever the parser changes
   useEffect(() => {
      if (!parser || !teamMatches) return;

      const matches = teamMatches.filter((val) =>
         val.team === teamKey
      ).map((val) => val.match) || [];
      let teleSum = 0;
      let autoSum = 0;
      for (const match of matches) {
         const points = parser.getMatchTeamPoints(match, teamKey);
         teleSum += points.tele || 0;
         autoSum += points.auto || 0;
      }
      setTeleAvg(teleSum / (matches.length || 1));
      setAutoAvg(autoSum / (matches.length || 1));

      setCoralL4(
         (parser.getTeamL4Scored(teamKey)[teamKey] ?? []).reduce((sum, val) =>
            sum + val, 0) /
            ((parser.getTeamL4Scored(teamKey)[teamKey] ?? []).length || 1),
      );
      setCoralL3(
         (parser.getTeamL3Scored(teamKey)[teamKey] ?? []).reduce((sum, val) =>
            sum + val, 0) /
            ((parser.getTeamL3Scored(teamKey)[teamKey] ?? []).length || 1),
      );
      setCoralL2(
         (parser.getTeamL2Scored(teamKey)[teamKey] ?? []).reduce((sum, val) =>
            sum + val, 0) /
            ((parser.getTeamL2Scored(teamKey)[teamKey] ?? []).length || 1),
      );
      setCoralL1(
         (parser.getTeamL1Scored(teamKey)[teamKey] ?? []).reduce((sum, val) =>
            sum + val, 0) /
            ((parser.getTeamL1Scored(teamKey)[teamKey] ?? []).length || 1),
      );
      setAlgaeNet(
         (parser.getTeamNetScored(teamKey)[teamKey] ?? []).reduce((sum, val) =>
            sum + val, 0) /
            ((parser.getTeamNetScored(teamKey)[teamKey] ?? []).length || 1),
      );
      setAlgaeProc(
         (parser.getTeamProcessorScored(teamKey)[teamKey] ?? []).reduce(
            (sum, val) =>
               sum + val,
            0,
         ) /
            ((parser.getTeamProcessorScored(teamKey)[teamKey] ?? []).length ||
               1),
      );

      setComments(parser.getTeamComments() || []);
   }, [parser, teamMatches, teamKey]);

   // Set graphed values whenever the metricOption changes.
   useEffect(() => {
      async function setValues() {
         if (isLoading) return;
         setIsLoading(true);
         const currentRequestId = ++latestRequestIdRef.current;

         if (
            metricOption !== "total" &&
            metricOption !== "auto" &&
            metricOption !== "tele" &&
            !MetricDescriptions[2025][metricOption as keyof TeamMetrics[2025]]
         ) {
            throwNotification("error", "No such query key");
            setIsLoading(false);
            return;
         }

         try {
            const matchData = await fetchMatchDataByEvent(getEvent() || "");
            if (currentRequestId !== latestRequestIdRef.current) return;
            if (!matchData) {
               setIsLoading(false);
               return;
            }

            const newParser = new DataParser2025(matchData);
            // Use the new parser if needed
            if (!newParser) return;

            const getMetric = (teamKey: string) => {
               // For our default metrics
               if (
                  metricOption === "total" ||
                  metricOption === "auto" ||
                  metricOption === "tele"
               ) {
                  const records: { matchKey: string; value: number }[] = [];
                  newParser
                     .getParserData()
                     .filter((val) => val.team === teamKey)
                     .forEach((val) => {
                        const pts = newParser.getMatchTeamPoints(
                           val.match,
                           teamKey,
                        );
                        let v = 0;
                        if (metricOption === "tele") v = pts.tele;
                        else if (metricOption === "auto") v = pts.auto;
                        else if (metricOption === "total") {
                           v = pts.auto + pts.tele;
                        }
                        records.push({ matchKey: val.match, value: v });
                     });
                  return records;
               }
               // For extra metrics from MetricDescriptions
               return newParser.getTeamMatchMetricRecord<number, 2025>(
                  metricOption as keyof MatchMetrics[2025],
                  teamKey,
               );
            };

            if (currentRequestId !== latestRequestIdRef.current) return;
            const metricValues = getMetric(teamKey) || [];
            setGraphedValues(metricValues);
         } catch (error) {
            console.error("Error fetching data:", error);
            throwNotification("error", "Failed to fetch match data");
         } finally {
            if (currentRequestId === latestRequestIdRef.current) {
               setIsLoading(false);
            }
         }
      }

      setValues();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [metricOption]);

   const matchOptions = teamMatches?.map((match) => ({
      key: match.match,
      title: parseMatchKey(match.match, "nexus"),
   })) || [];

   const [currentReplay, setCurrentReplay] = useState<
      Tables<"event_match_data">
   >();

   const TBAData = globData.TBAdata.find((val) => val.key == teamKey);

   return (
      <div className={styles.container}>
         <ComparisonBox title="Team Information">
            {pitData?.comment
               ? (
                  <>
                     <div className={styles.teamInfoBox}>
                        {teamImageUrl
                           ? (
                              <img
                                 className={styles.image}
                                 src={teamImageUrl}
                                 alt="Team"
                              />
                           )
                           : (
                              <div
                                 className={styles.image}
                                 style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "var(--text-background)",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                 }}
                              >
                                 <i
                                    className="fa-solid fa-robot"
                                    style={{ fontSize: "3.5rem" }}
                                 >
                                 </i>
                                 No image
                              </div>
                           )}
                        <div className={styles.statsBox}>
                           <div className={styles.header}>
                              Scouted by {teamData?.name}
                           </div>
                           <div
                              style={{
                                 width: "100%",
                                 height: "0.15rem",
                                 margin: "0.15rem 0",
                                 background: "var(--text-background)",
                                 borderRadius: "1rem",
                                 flexShrink: 0,
                              }}
                           />
                           <div className={styles.infoEntry}>
                              Event Ranking
                              <div>
                                 {TBAData?.rank ? "#" + TBAData.rank : "N/A"}
                              </div>
                           </div>
                           <div className={styles.infoEntry}>
                              Next Match
                              <div>
                                 {TBAData?.nextMatch
                                    ? parseMatchKey(
                                       TBAData.nextMatch,
                                       "shorter",
                                    )
                                    : "N/A"}
                              </div>
                           </div>
                           <div
                              style={{
                                 width: "100%",
                                 height: "0.15rem",
                                 margin: "0.15rem 0",
                                 background: "var(--text-background)",
                                 borderRadius: "1rem",
                                 flexShrink: 0,
                              }}
                           />
                           <div className={styles.infoEntry}>
                              Statbotics EPA{" "}
                              <div>
                                 {globData.EPAdata[teamKey]?.epa?.total_points
                                    .mean || 0}
                              </div>
                           </div>
                           <div className={styles.infoEntry}>
                              Point Contribution<div>
                                 {(teleAvg + autoAvg).toFixed(2)}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div style={{ display: "flex", gap: "0.5rem" }}>
                        <div className={styles.archetype}>
                           <div className={styles.infoHeader}>
                              Description
                           </div>
                           <div
                              style={{
                                 width: "100%",
                                 height: "0.15rem",
                                 margin: "0.15rem 0",
                                 background: "var(--text-background)",
                                 borderRadius: "1rem",
                                 flexShrink: 0,
                              }}
                           />
                           {pitData.robotArchetype}
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
                                 <i className="fa-solid fa-robot"></i> Ground
                              </div>
                              <div
                                 style={{
                                    color: pitData.canReefAlgae
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 <i className="fa-solid fa-robot"></i> Reef
                              </div>
                              <div
                                 style={{
                                    color: pitData.canScoreProcessor
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 <i className="fa-solid fa-right-to-bracket">
                                 </i>{" "}
                                 Processor
                              </div>
                              <div
                                 style={{
                                    color: pitData.canScoreNet
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 <i className="fa-solid fa-right-to-bracket">
                                 </i>{" "}
                                 Net
                              </div>
                           </div>
                           <div
                              className={styles.abilityCategory}
                              style={{ marginInline: "1.5rem" }}
                           >
                              <div className={styles.abilityHeader}>Coral</div>
                              <div
                                 style={{
                                    color: pitData.canGroundCoral
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 <i className="fa-solid fa-robot"></i> Ground
                              </div>
                              <div
                                 style={{
                                    color: pitData.canSourceCoral
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 <i className="fa-solid fa-robot"></i> Station
                              </div>
                              <div className={styles.coralReef}>
                                 {["L1", "L2", "L3", "L4"].map((level, idx) => (
                                    <div
                                       key={level}
                                       style={{
                                          color: pitData.canScoreReef[idx]
                                             ? "var(--text-primary)"
                                             : "",
                                       }}
                                    >
                                       {level}
                                    </div>
                                 ))}
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
                                 Deep
                              </div>
                              <div
                                 style={{
                                    color: pitData.canClimbShallow
                                       ? "var(--text-primary)"
                                       : "",
                                 }}
                              >
                                 Shallow
                              </div>
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
         </ComparisonBox>

         <ComparisonBox title="Match Data">
            {teamMatches && teamMatches.length > 0
               ? (
                  <>
                     <div className={styles.performanceGraphHeader}>
                        <UniversalDropdown
                           options={allMetrics}
                           value={metricOption}
                           onChange={(key) => setMetricOption(key)}
                        />
                        {isLoading && (
                           <div className={styles.loading}>loading...</div>
                        )}
                     </div>
                     <div className={styles.metricGraph}>
                        <div className={styles.metricGraphDetails}>
                           <Tippy
                              content={MetricDescriptions[2025][
                                    metricOption as keyof TeamMetrics[2025]
                                 ]
                                 ? MetricDescriptions[2025][
                                    metricOption as keyof TeamMetrics[2025]
                                 ].title
                                 : metricOption === "auto"
                                 ? "Auto Points"
                                 : metricOption === "tele"
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
                                       metricOption as keyof TeamMetrics[2025]
                                    ]
                                    ? MetricDescriptions[2025][
                                       metricOption as keyof TeamMetrics[2025]
                                    ].title
                                    : metricOption === "auto"
                                    ? "Auto Points"
                                    : metricOption === "tele"
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
                                    ? Math.max(
                                       ...graphedValues.map((val) => val.value),
                                    ).toFixed(1)
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
                                    ? Math.min(
                                       ...graphedValues.map((val) => val.value),
                                    ).toFixed(1)
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
                                       (sum, val) => sum + val.value,
                                       0,
                                    ) / graphedValues.length).toFixed(1)
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
                              <div style={{ fontSize: "1rem" }}>RMS</div>
                              <div style={{ fontSize: "1.2rem" }}>
                                 {graphedValues.length > 0
                                    ? Math.sqrt(
                                       graphedValues.reduce(
                                          (sum, val) => sum + val.value ** 2,
                                          0,
                                       ) / graphedValues.length,
                                    ).toFixed(1)
                                    : "0.0"}
                              </div>
                           </div>
                        </div>
                        <div style={{ flexGrow: 1, width: "1rem" }}>
                           <PicklistLineGraph
                              valueArray={graphedValues}
                              axisTicks={3}
                           />
                        </div>
                     </div>
                     <div className={styles.commentsBox}>
                        <div className={styles.commentsWrapper}>
                           {comments
                              .sort((a, b) => {
                                 const getMatchNumber = (key: string) =>
                                    parseInt(
                                       key.split("_")[1].replace(/\D/g, ""),
                                       10,
                                    );
                                 return getMatchNumber(b.matchKey) -
                                    getMatchNumber(a.matchKey);
                              })
                              .map((val, index) => (
                                 <div key={index} className={styles.comment}>
                                    <div
                                       style={{
                                          color: "var(--primary)",
                                          display: "flex",
                                          gap: "0.25rem",
                                       }}
                                    >
                                       {parseMatchKey(val.matchKey, "short")} |
                                       {" "}
                                       <div
                                          style={{
                                             whiteSpace: "nowrap",
                                             overflow: "hidden",
                                             textOverflow: "ellipsis",
                                             maxWidth: "6rem",
                                             color: "var(--primary)",
                                          }}
                                       >
                                          {val.author}
                                       </div>
                                    </div>
                                    {val.comment}
                                 </div>
                              ))}
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
         <ComparisonBox title="Match Replays">
            <div className={styles.performanceGraphHeader}>
               <UniversalDropdown
                  options={matchOptions}
                  value={currentReplay?.match || ""}
                  onChange={(key) => {
                     const selectedMatch = teamMatches?.find(
                        (match) => match.match === key,
                     );
                     if (selectedMatch) setCurrentReplay(selectedMatch);
                  }}
               />
            </div>
            {currentReplay && <MatchReplayFieldMap matchData={currentReplay} />}
         </ComparisonBox>
         <ComparisonBox title="Stats Overview">
            <div className={styles.performanceCardContainer}>
               <div className={styles.performanceCardContainer}>
                  <div className={styles.perfCard}>
                     <div className={styles.perfCardText}>
                        Total Avg.
                        <div
                           className={styles.perfCardText}
                           style={{ fontSize: "1.5rem" }}
                        >
                           {(teleAvg + autoAvg).toFixed(1)}
                        </div>
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     <div className={styles.perfCardText}>
                        Tele Avg.
                        <div
                           className={styles.perfCardText}
                           style={{ fontSize: "1.5rem" }}
                        >
                           {teleAvg.toFixed(1)}
                        </div>
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     <div className={styles.perfCardText}>
                        Auto Avg.
                        <div
                           style={{ fontSize: "1.5rem" }}
                        >
                           {autoAvg.toFixed(1)}
                        </div>
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     <div className={styles.perfCardText}>
                        Coral Avg.
                        <div
                           className={styles.perfCardText}
                           style={{ fontSize: "1.5rem" }}
                        >
                           {(coralL4 + coralL3 + coralL2 + coralL1).toFixed(1)}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </ComparisonBox>
      </div>
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
