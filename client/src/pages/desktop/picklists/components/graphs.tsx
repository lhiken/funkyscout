/** yearly rewrite required
 * Create a new "graph" element for each year
 * that outputs each metric in a certain format
 * passed to the "add metric" function.
 */

import { Dispatch, SetStateAction, useState } from "react";
import { DisplayedMetric } from "../../../../schemas/defs";
import { DataParser2024 } from "../../../../schemas/parser";
import { MetricDescriptions } from "../../../../schemas/schema";
import styles from "../comparison-box/metrics/metrics.module.css";

export function MetricCategory2024(
   { addMetric, metrics }: {
      addMetric: (metric: DisplayedMetric) => void;
      metrics: DisplayedMetric[];
   },
) {
   function entryIsActive(entryName: string) { // A function that checks if a given metric is displayed
      return metrics.filter((val) => val.title == entryName).length > 0;
   }

   const [showAll, setShowAll] = useState(false);

   const metricDescriptions = MetricDescriptions[2024]; // Get the descriptions for the year
   const parser = new DataParser2024([]);

   function handleSelectNotesScored() { // A function that adds the metric to the list of metrics
      const data = parser.convertValueArrayToMeanArray(
         parser.convertTeamKeyObjectToArray(parser.getTeamNotesScored()),
      );

      console.log(data);

      addMetric({
         title: "Notes Scored",
         values: data,
         type: "bar",
      });
   }

   return (
      <div className={styles.metricCategory}>
         <MetricCategoryHeader
            title="Scouting Data"
            show={showAll}
            setShow={setShowAll}
         />
         {showAll && (
            <div className={styles.metricsList}>
               <MetricEntry
                  entryName={metricDescriptions.notesScored.title}
                  fn={handleSelectNotesScored}
                  active={entryIsActive(metricDescriptions.notesScored.title)}
               />
            </div>
         )}
      </div>
   );
}

/* Everything below does not need to be changed
 */

function MetricCategoryHeader(
   { title, setShow, show }: {
      title: string;
      setShow: Dispatch<SetStateAction<boolean>>;
      show: boolean;
   },
) {
   return (
      <div
         className={styles.metricsHeader}
         onClick={() => setShow((prev) => !prev)}
      >
         {title}
         <div className={styles.metricsHeaderIcon}>
            {show
               ? <i className="fa-solid fa-chevron-up" />
               : <i className="fa-solid fa-chevron-down" />}
         </div>
      </div>
   );
}

function MetricEntry(
   { fn, entryName, active }: {
      fn: () => void;
      entryName: string;
      active: boolean;
   },
) {
   const [hovered, setHovered] = useState(false);

   return (
      <div
         className={`${styles.metricEntry} ${active && styles.active}`}
         onClick={fn}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
      >
         {entryName}
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
