import { Dispatch, SetStateAction, useContext, useState } from "react";
import { DisplayedMetric } from "../../schemas/defs";
import { AnimatePresence, motion } from "motion/react";
import styles from "./metrics.module.css";
import { GlobalTeamDataContext } from "../../app-global-ctx";
import { MetricDescriptions, TeamMetrics } from "../../schemas/schema";

export function DesktopMetricsSelector(
   { setMetrics, setShow, displayedMetrics }: {
      displayedMetrics: DisplayedMetric[];
      setMetrics: Dispatch<SetStateAction<DisplayedMetric[]>>;
      setShow: Dispatch<SetStateAction<boolean>>;
   },
) {
   const [hoveringOverMetrics, setHoveringOverMetrics] = useState(false);
   const COPRs = useContext(GlobalTeamDataContext).COPRdata;

   function addMetric(metric: DisplayedMetric) {
      setMetrics((prev) => {
         const newMetric = prev.slice();

         console.log(newMetric);

         if (prev.filter((val) => val.title == metric.title).length > 0) {
            return newMetric.filter((val) => val.title != metric.title);
         }

         return [metric, ...prev];
      });
   }

   function handleToggleCOPR(itemKey: string) {
      const values = COPRs[itemKey];

      const teamValueArray = Object.keys(values).map((val) => {
         return { teamKey: val, value: values[val] };
      });

      const newMetric: DisplayedMetric = {
         title: itemKey,
         values: teamValueArray,
         type: "bar",
      };

      addMetric(newMetric);
   }

   const metrics = MetricDescriptions[2024];

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{
            duration: 0.1,
         }}
         className={styles.allMetricsBox}
         onClick={() => !hoveringOverMetrics && setShow(false)}
      >
         <div
            className={styles.metricsContainer}
            onMouseEnter={() => setHoveringOverMetrics(true)}
            onMouseLeave={() => setHoveringOverMetrics(false)}
         >
            <div className={styles.metricsHeader}>
               Comparable Metrics
            </div>
            <div className={styles.seperator} />
            <MetricCategory
               metrics={displayedMetrics}
               title="Scouting Data"
               entryKeys={Object.keys(metrics).map((val) => {
                  const key = val as keyof TeamMetrics[2024];
                  return metrics[key].title;
               })}
               entryCallback={() => {}}
            />
            <MetricCategory
               metrics={displayedMetrics}
               title="EPA"
               entryKeys={["Mean EPA"]}
               entryCallback={() => {}}
            />
            <MetricCategory
               metrics={displayedMetrics}
               title="COPRs"
               entryKeys={Object.keys(COPRs).filter((val) =>
                  val[0] == val[0].toUpperCase()
               )}
               entryCallback={handleToggleCOPR}
            />
         </div>
      </motion.div>
   );
}

function MetricCategory({
   title,
   entryKeys,
   entryCallback,
   metrics,
}: {
   title: string;
   entryKeys: string[];
   entryCallback: (key: string) => void;
   metrics: DisplayedMetric[];
}) {
   const [showCategory, setShowCategory] = useState(false);

   return (
      <div className={styles.metricCategory}>
         <div
            className={styles.metricsHeader}
            onClick={() => setShowCategory(!showCategory)}
         >
            {title}
            <div className={styles.metricsHeaderIcon}>
               {showCategory
                  ? <i className="fa-solid fa-chevron-up" />
                  : <i className="fa-solid fa-chevron-down" />}
            </div>
         </div>
         <AnimatePresence>
            {showCategory && (
               <>
                  <motion.div
                     initial={{ flexGrow: 0, opacity: 0 }}
                     animate={{ flexGrow: 1, opacity: 1 }}
                     exit={{ flexGrow: 0, opacity: 0 }}
                     transition={{
                        duration: 0.1,
                     }}
                     className={styles.metricsList}
                  >
                     {entryKeys.map((val, index) => {
                        return (
                           <MetricEntry
                              metrics={metrics}
                              key={index}
                              callback={entryCallback}
                              entryKey={val}
                           />
                        );
                     })}
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}

function MetricEntry(
   { callback, entryKey, metrics }: {
      callback: (key: string) => void;
      entryKey: string;
      metrics: DisplayedMetric[];
   },
) {
   const [hovered, setHovered] = useState(false);

   const active = Object.values(metrics).map((val) => val.title).includes(
      entryKey,
   );

   return (
      <div
         className={`${styles.metricEntry} ${active && styles.active}`}
         onClick={() => callback(entryKey)}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
      >
         {entryKey}
         {hovered && (
            <div>
               {active
                  ? (
                     <i
                        className="fa-solid fa-trash"
                        style={{ color: "var(--error)" }}
                     />
                  )
                  : (
                     <i
                        className="fa-solid fa-plus"
                        style={{ color: "var(--success" }}
                     />
                  )}
            </div>
         )}
      </div>
   );
}
