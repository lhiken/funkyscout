import { Dispatch, SetStateAction, useContext, useState } from "react";
import { DisplayedMetric } from "../../../../../schemas/defs";
import { AnimatePresence, motion } from "motion/react";
import styles from "./metrics.module.css";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";
import { getEventYear } from "../../../../../utils/logic/app";
import {
   MetricCategory2024,
   MetricCategory2025,
} from "../../components/graphs";

export function DesktopMetricsSelector(
   { setMetrics, setShow, displayedMetrics }: {
      displayedMetrics: DisplayedMetric[];
      setMetrics: Dispatch<SetStateAction<DisplayedMetric[]>>;
      setShow: Dispatch<SetStateAction<boolean>>;
   },
) {
   const [hoveringOverMetrics, setHoveringOverMetrics] = useState(false);
   const COPRs = useContext(GlobalTeamDataContext).COPRdata;
   const EPAs = useContext(GlobalTeamDataContext).EPAdata;

   const EPABreakdown = Object.keys(() => {
      const reference = Object.values(EPAs)[0].epa;
      return reference.breakdown ? reference.breakdown : ["N/A"];
   })
      .filter((val) => val.toLowerCase() == val).map((val) => {
         return `EPA - ${
            val // Formatting Statbotics' snake case
               .replace(/_/g, " ")
               .replace(/\b\w/g, (char) => char.toUpperCase())
         }`;
      });

   function addMetric(metric: DisplayedMetric) {
      setMetrics((prev) => {
         const newMetric = prev.slice();

         if (prev.filter((val) => val.title == metric.title).length > 0) {
            return newMetric.filter((val) => val.title != metric.title);
         }

         return [metric, ...prev];
      });
   }

   function handleToggleCOPR(itemKey: string) {
      // Un-formatting into camel caase
      const newKey = itemKey.substring(6).toLowerCase()
         .replace(/ ([a-z0-9])/g, (_, char) => char.toUpperCase());

      const values = COPRs[newKey] || COPRs[itemKey.substring(6)] ||
         COPRs[itemKey.substring(6).toLowerCase()];

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

   function handleToggleEPA(itemKey: string) {
      let indexKey: "total_points" | "unitless" | "norm" | "breakdown" =
         "unitless";

      switch (itemKey) {
         case "EPA - Unitless":
            indexKey = "unitless";
            break;
         case "EPA - Total Points":
            indexKey = "total_points";
            break;
         case "EPA - Normalized":
            indexKey = "norm";
            break;
         default:
            indexKey = "breakdown";
      }

      const teamValueArray = Object.keys(EPAs).map((val) => {
         if (EPAs[val].epa.total_points) {
            const finalValue = indexKey == "total_points"
               ? EPAs[val].epa.total_points.mean
               : indexKey != "breakdown"
               ? EPAs[val].epa[indexKey]
               : EPAs[val].epa // unformatting into snake case
                  .breakdown[
                     itemKey.substring(6).toLowerCase().replace(/ /g, "_")
                  ]
                  .mean;
            return { teamKey: val, value: finalValue };
         } else {
            return { teamKey: val, value: 0 };
         }
      });

      const newMetric: DisplayedMetric = {
         title: itemKey,
         values: teamValueArray,
         type: "bar",
      };

      addMetric(newMetric);
   }

   const year = getEventYear();

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
            {/* yearly rewrite required: add line for new MetricCategory202X, but it must be written first */}
            {year == 2024 && (
               <MetricCategory2024
                  addMetric={addMetric}
                  metrics={displayedMetrics}
               />
            )}
            {year == 2025 && (
               <MetricCategory2025
                  addMetric={addMetric}
                  metrics={displayedMetrics}
               />
            )}
            <MetricCategory
               metrics={displayedMetrics}
               title="Component EPA"
               entryKeys={EPABreakdown}
               entryCallback={handleToggleEPA}
            />
            <MetricCategory
               metrics={displayedMetrics}
               title="Component OPR"
               entryKeys={Object.keys(COPRs).map((val) =>
                  `OPR - ${
                     val // Formatting for TBA's camel case
                        .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
                        .replace(/([0-9])([A-Z])/g, "$1 $2")
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                  }`
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
                  <div className={styles.metricsList}>
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
                  </div>
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
