import { useState } from "react";
import styles from "./compare-content.module.css";

export default function ComparisonContent({ teamKey }: { teamKey: string }) {
   console.log(teamKey);

   return (
      <>
         <div className={styles.container}>
            <ComparisonBox title="Team Stats">
               <div className={styles.teamInfoContainer}>
                  <FallbackBox title="No data found" />
               </div>
            </ComparisonBox>{" "}
            <ComparisonBox title="Match Data">
               <div className={styles.teamInfoContainer}>
                  <FallbackBox title="No data found" />
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
