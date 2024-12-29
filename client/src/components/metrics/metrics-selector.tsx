import { Dispatch, SetStateAction, useContext, useState } from "react";
import { DisplayedMetric } from "../../schemas/defs";
import { AnimatePresence, motion } from "motion/react";
import styles from "./metrics.module.css";
import { GlobalTeamDataContext } from "../../app-global-ctx";

export function DesktopMetricsSelector({ setMetrics, setShow }: {
   metrics: DisplayedMetric[];
   setMetrics: Dispatch<SetStateAction<DisplayedMetric[]>>;
   setShow: Dispatch<SetStateAction<boolean>>;
}) {
   const [hoveringOverMetrics, setHoveringOverMetrics] = useState(false);
   const COPRs = useContext(GlobalTeamDataContext).COPRdata;

   function handleAddCOPR(itemKey: string) {
      const values = COPRs[itemKey];

      const teamValueArray = Object.keys(values).map((val) => {
         return { teamKey: val, value: values[val] };
      });

      const newMetric: DisplayedMetric = {
         title: itemKey,
         values: teamValueArray,
         type: "bar",
      };

      console.log(newMetric);

      setMetrics((prev) => {
         if (prev.filter((val) => val.title == newMetric.title).length > 0) {
            return prev;
         }
         return [...prev, newMetric];
      });
   }

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
               title="COPRs"
               entryKeys={Object.keys(COPRs)}
               entryCallback={handleAddCOPR}
            />
         </div>
      </motion.div>
   );
}

function MetricCategory({
   title,
   entryKeys,
   entryCallback,
}: {
   title: string;
   entryKeys: string[];
   entryCallback: (key: string) => void;
}) {
   const [showCategory, setShowCategory] = useState(false);

   return (
      <div className={styles.metricCategory}>
         <div className={styles.metricsHeader}>
            {title}
            <div
               onClick={() => setShowCategory(!showCategory)}
            >
               <i className="fa-solid fa-chevron-down" />
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
                           <div
                              className={styles.metricEntry}
                              key={index}
                              onClick={() => entryCallback(val)}
                           >
                              {val}
                           </div>
                        );
                     })}
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}
