import {
   SetStateAction,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";
import styles from "./comparison.module.css";
import {
   ComparedTeamKeysContext,
   PicklistCommandContext,
   TargetPicklistContext,
} from "../picklists-context";
import {
   AnimatePresence,
   motion,
   Reorder,
   useDragControls,
} from "motion/react";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";
import { parseTeamKey } from "../../../../utils/logic/app";
import Tippy from "@tippyjs/react";
import PicklistBarGraph from "./graphs/bar";
import { getUsedMetrics, setUsedMetrics } from "../picklist-state-handler";
import { DisplayedMetric } from "../../../../schemas/defs";
import { DesktopMetricsSelector } from "./metrics/metrics-selector";
import ComparisonContent from "./compare-content";

function ComparisonTab() {
   const targetPicklist = useContext(TargetPicklistContext);
   const comparedTeams = useContext(ComparedTeamKeysContext);

   return (
      <div className={styles.container}>
         {!targetPicklist.val &&
            (
               <div className={styles.errorBox}>
                  Choose a picklist to get started
               </div>
            )}
         {!targetPicklist.val || comparedTeams.val?.length == 0 &&
               (
                  <div className={styles.errorBox}>
                     Choose a team to see its stats
                  </div>
               )}
         {targetPicklist.val && comparedTeams.val &&
            comparedTeams.val?.length > 0 && (
            <>
               <ComparedTeams />
               <TeamGraphs />
            </>
         )}
      </div>
   );
}

function ComparedTeams() {
   const focusTeams = useContext(ComparedTeamKeysContext);

   useEffect(() => {
      if (focusTeams.val && focusTeams.setVal) {
         const maximizedTeams = focusTeams.val.filter((val) => !val.minimized);

         let newTeams = [...focusTeams.val];

         if (maximizedTeams.length > 2) {
            const lastMaximizedTeamKey =
               maximizedTeams[maximizedTeams.length - 1].teamKey;

            newTeams = newTeams.map((val) =>
               val.teamKey === lastMaximizedTeamKey
                  ? { ...val, minimized: true }
                  : val
            );
         }

         if (newTeams.length > 4) {
            const lastMinimizedIndex = newTeams
               .map((val, index) => ({ ...val, index }))
               .filter((val) => val.minimized)
               .slice(-1)[0]?.index;

            if (lastMinimizedIndex !== undefined) {
               newTeams.splice(lastMinimizedIndex, 1);
            }
         }

         focusTeams.setVal(
            newTeams.sort((a, b) => Number(a.minimized) - Number(b.minimized)),
         );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [focusTeams.val?.length]);

   if (!focusTeams.val || !focusTeams.setVal) return;

   return (
      <Reorder.Group
         axis="x"
         values={focusTeams.val}
         onReorder={focusTeams.setVal}
         className={styles.comparedTeamsContainer}
         as="div"
      >
         {focusTeams.val.sort((a, b) =>
            Number(a.minimized) - Number(b.minimized)
         )
            .map((val) => {
               return <ComparedTeamElement key={val.teamKey} team={val} />;
            })}
      </Reorder.Group>
   );
}

function ComparedTeamElement(
   { team }: { team: { teamKey: string; minimized: boolean } },
) {
   const focusTeams = useContext(ComparedTeamKeysContext);
   const picklistCommands = useContext(PicklistCommandContext);
   const controls = useDragControls();

   const teamName =
      useContext(GlobalTeamDataContext).EPAdata[team.teamKey]?.team_name ||
      "N/A";

   function handleMinimizeToggle() {
      if (focusTeams.setVal && focusTeams.val) {
         const maxTeams = focusTeams.val.filter((val) => !val.minimized);

         focusTeams.setVal((prev) => {
            if (!team.minimized) {
               return prev.map((val) =>
                  val.teamKey === team.teamKey
                     ? { ...val, minimized: true }
                     : val
               );
            }

            const updatedTeams = prev.map((val) => ({
               ...val,
               minimized: maxTeams.length >= 2 &&
                     val.teamKey ===
                        maxTeams[maxTeams.length - 1].teamKey
                  ? true
                  : val.minimized,
            }));

            return [
               ...updatedTeams.filter((val) => val.teamKey !== team.teamKey),
               {
                  teamKey: team.teamKey,
                  minimized: false,
               },
            ];
         });
      }
   }

   function handleCompare() {
      if (focusTeams.setVal) {
         focusTeams.setVal((prev) =>
            prev.filter((val) => val.teamKey != team.teamKey)
         );
      }
   }

   function handleMoveUp() {
      picklistCommands.moveTeamUp(team.teamKey);
   }

   function handleMoveDown() {
      picklistCommands.moveTeamDown(team.teamKey);
   }

   function handleExclude() {
      picklistCommands.excludeTeam(team.teamKey);
   }

   const [showSettings, setShowSettings] = useState(false);

   return (
      <Reorder.Item
         key={team.teamKey}
         value={team}
         dragListener={false}
         dragControls={controls}
         as="div"
         className={team.minimized
            ? styles.comparedTeamsMinimized
            : styles.comparedTeamElement}
         onMouseEnter={() => team.minimized && setShowSettings(true)}
         onMouseLeave={() => team.minimized && setShowSettings(false)}
      >
         {!team.minimized && (
            <div
               className={styles.teamHeader}
               onMouseEnter={() => setShowSettings(true)}
               onMouseLeave={() => setShowSettings(false)}
            >
               <div
                  className={styles.teamHeaderText}
                  onPointerDown={(e) => controls.start(e)}
               >
                  <div>
                     <i className="fa-solid fa-grip-vertical" />
                  </div>&nbsp;
                  <div
                     style={{
                        display: "flex",
                        gap: "0.2rem",
                        overflow: "visible",
                        width: "1rem",
                     }}
                  >
                     {parseTeamKey(team.teamKey)}
                     <div style={{ color: "var(--text-secondary)" }}>|</div>
                     {" "}
                     <div
                        style={{
                           whiteSpace: "nowrap",
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                           width: "9vw",
                           marginRight: "2rem",
                           flexShrink: "0",
                        }}
                     >
                        {teamName}
                     </div>
                  </div>
               </div>
               <div className={styles.elementOptions}>
                  <Tippy content="Minimize tab">
                     <i
                        className={`fa-solid fa-compress ${styles.elementOptionButton}`}
                        onClick={handleMinimizeToggle}
                        style={{
                           fontSize: "1.2rem",
                           paddingRight: 0,
                        }}
                     />
                  </Tippy>
                  <Tippy content="Stop comparing">
                     <i
                        className={`fa-solid fa-scale-unbalanced-flip ${styles.elementOptionButton}`}
                        onClick={handleCompare}
                     />
                  </Tippy>
                  <AnimatePresence>
                     {showSettings && (
                        <motion.div
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           exit={{ x: 20, opacity: 0 }}
                           transition={{
                              duration: 0.1,
                           }}
                           className={styles.expandedSettings}
                        >
                           <Tippy content="Exclude">
                              <i
                                 className={`fa-solid fa-ban ${styles.elementOptionButton}`}
                                 onClick={handleExclude}
                              />
                           </Tippy>
                           <Tippy content="Move up">
                              <i
                                 className={`fa-solid fa-arrow-up ${styles.elementOptionButton}`}
                                 onClick={handleMoveUp}
                              />
                           </Tippy>
                           <Tippy content="Move down">
                              <i
                                 className={`fa-solid fa-arrow-down ${styles.elementOptionButton}`}
                                 onClick={handleMoveDown}
                              />
                           </Tippy>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         )}
         <AnimatePresence>
            {team.minimized && (
               <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                     duration: 0.4,
                     ease: "easeIn",
                  }}
                  className={styles.minimizedContainer}
               >
                  <Tippy
                     content={`${parseTeamKey(team.teamKey)} | ${teamName}`}
                     placement="left"
                  >
                     <div
                        className={styles.teamName}
                        onPointerDown={(e) => controls.start(e)}
                     >
                        <div>
                           <i
                              className={`fa-solid fa-grip ${styles.gripControl}`}
                           />
                        </div>
                        {parseTeamKey(team.teamKey)} <div>|</div>{" "}
                        <div
                           style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              height: "20vh",
                           }}
                        >
                           {teamName}
                        </div>
                     </div>
                  </Tippy>
                  <div className={styles.elementOptionsMinimized}>
                     <AnimatePresence>
                        {showSettings && (
                           <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 20, opacity: 0 }}
                              transition={{
                                 duration: 0.1,
                              }}
                              className={styles.minimizedExpandedSettings}
                           >
                              <Tippy content="Exclude" placement="left">
                                 <i
                                    className={`fa-solid fa-ban ${styles.elementOptionButton} ${styles.minimized}`}
                                    onClick={handleExclude}
                                 />
                              </Tippy>
                              <Tippy content="Move up" placement="left">
                                 <i
                                    className={`fa-solid fa-arrow-up ${styles.elementOptionButton} ${styles.minimized}`}
                                    onClick={handleMoveUp}
                                 />
                              </Tippy>
                              <Tippy content="Move down" placement="left">
                                 <i
                                    className={`fa-solid fa-arrow-down ${styles.elementOptionButton} ${styles.minimized}`}
                                    onClick={handleMoveDown}
                                 />
                              </Tippy>
                           </motion.div>
                        )}
                     </AnimatePresence>
                     <Tippy content="Stop comparing" placement="left">
                        <i
                           className={`fa-solid fa-scale-unbalanced-flip ${styles.elementOptionButton} ${styles.minimized}`}
                           style={{
                              fontSize: "0.95rem",
                              padding: "0.3rem 0rem",
                           }}
                           onClick={handleCompare}
                        />
                     </Tippy>
                     <Tippy content="Maximize tab" placement="left">
                        <i
                           className={`fa-solid fa-expand ${styles.elementOptionButton} ${styles.minimized}`}
                           onClick={handleMinimizeToggle}
                        />
                     </Tippy>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
         {!team.minimized && (
            <>
               <div className={styles.lineSeperator} />
               <ComparisonContent teamKey={team.teamKey} />
            </>
         )}
      </Reorder.Item>
   );
}

function TeamGraphs() {
   const [metrics, setMetrics] = useState<DisplayedMetric[]>([]);
   const [rendered, setRendered] = useState(false);

   useEffect(() => {
      const metrics = getUsedMetrics();
      setRendered(true);
      if (metrics) setMetrics(metrics);
   }, []);

   useEffect(() => {
      if (rendered) setUsedMetrics(metrics);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [metrics]);

   const [showAllMetrics, setShowAllMetrics] = useState(false);

   return (
      <div className={styles.teamGraphsContainer}>
         <Reorder.Group
            axis="x"
            values={metrics}
            onReorder={setMetrics}
            layoutScroll
            className={styles.teamMetricsContainer}
            as="div"
         >
            <div className={styles.seperator} />
            {metrics.map((val) => {
               return (
                  <TeamGraphElement
                     key={val.title + val.values}
                     metric={val}
                     setMetric={setMetrics}
                  />
               );
            })}
            {metrics.length == 0 && (
               <div
                  className={styles.errorBox}
                  onClick={() => setShowAllMetrics(!showAllMetrics)}
               >
                  Choose a metric to graph
               </div>
            )}
         </Reorder.Group>
         <Tippy content="Add a new metric" placement="left">
            <div
               className={styles.newMetricButton}
               onClick={() => setShowAllMetrics(!showAllMetrics)}
            >
               <i className="fa-solid fa-plus" />
            </div>
         </Tippy>
         <AnimatePresence>
            {showAllMetrics && (
               <DesktopMetricsSelector
                  displayedMetrics={metrics}
                  setMetrics={setMetrics}
                  setShow={setShowAllMetrics}
               />
            )}
         </AnimatePresence>
      </div>
   );
}

function TeamGraphElement({ metric, setMetric }: {
   metric: DisplayedMetric;
   setMetric: React.Dispatch<SetStateAction<DisplayedMetric[]>>;
}) {
   const comparedTeams = useContext(ComparedTeamKeysContext);

   const values = useMemo(() => {
      return metric.values.filter((val) =>
         comparedTeams.val?.map((val) => val.teamKey).includes(val.teamKey)
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [comparedTeams.val?.length]);

   const [showRemove, setShowRemove] = useState(false);

   return (
      <Reorder.Item
         key={metric.title}
         value={metric}
         as="div"
         className={styles.teamGraphElement}
      >
         <div className={styles.teamGraphDetails}>
            <div
               className={styles.teamGraphHeader}
               onMouseEnter={() => setShowRemove(true)}
               onMouseLeave={() => setShowRemove(false)}
            >
               <Tippy content={metric.title}>
                  <div
                     style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                     }}
                  >
                     {metric.title.replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </div>
               </Tippy>
               {showRemove && (
                  <div
                     className={styles.teamGraphIcon}
                     onClick={() =>
                        setMetric((prev) =>
                           prev.filter((val) => val.title != metric.title)
                        )}
                  >
                     <i className="fa-solid fa-xmark" />
                  </div>
               )}
            </div>
            <div className={styles.teamGraphValues}>
               {values.map((val) => {
                  return (
                     <div
                        className={`${styles.teamGraphValueEntry} ${
                           values.reduce(
                                 (max, val) =>
                                    val.value > max.value ? val : max,
                                 values[0],
                              ).teamKey == val.teamKey && styles.active
                        }`}
                     >
                        {parseTeamKey(val.teamKey)}{" "}
                        <div
                           style={{
                              color: (values.reduce(
                                    (max, val) =>
                                       val.value > max.value ? val : max,
                                    values[0],
                                 ).teamKey == val.teamKey
                                 ? "var(--text-primary)"
                                 : "var(--text-secondary)"),
                           }}
                        >
                           {val.value < 1
                              ? val.value.toFixed(2)
                              : val.value.toFixed(1)}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
         <div className={styles.teamGraph}>
            {metric.type == "bar" && (
               <PicklistBarGraph
                  valueObject={values}
                  indexByKey="teamKey"
                  keysOfSeries={["value"]}
                  axisTicks={0}
                  key={metric.title}
               />
            )}
         </div>
      </Reorder.Item>
   );
}

export default ComparisonTab;
