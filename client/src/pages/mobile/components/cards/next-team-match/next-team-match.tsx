import { useEffect, useState } from "react";
import styles from "./next-team-match.module.css";
import {
   getNexusEventStatus,
   NexusMatch,
} from "../../../../../lib/nexus/events";
import {
   getFocusTeam,
   parseTeamKey,
   timeFromNow,
} from "../../../../../utils/logic/app";

export function MobileNextTeamMatchCard() {
   const [nextMatch, setNextMatch] = useState<NexusMatch>();

   async function getNextMatch() {
      const data = await getNexusEventStatus("demo9922");
      if (data) {
         const nextMatch = data.matches.filter((val) =>
            [...val.blueTeams, ...val.redTeams].includes(
               parseTeamKey(getFocusTeam() || "846"),
            )
         )
            .reduce((closest, current) =>
               Math.abs(
                     new Date(current.times.estimatedStartTime).getTime() -
                        Date.now(),
                  ) <
                     Math.abs(
                        new Date(closest.times.estimatedStartTime).getTime() -
                           Date.now(),
                     )
                  ? current
                  : closest
            );

         setNextMatch(nextMatch);
      } else {
         return false;
      }
   }

   useEffect(() => {
      getNextMatch();
   }, []);

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            Next Match <div style={{ color: "var(--text-background)" }}>|</div>
            {" "}
            <div style={{ color: "var(--text-primary)" }}>
               {nextMatch?.label + " " +
                  timeFromNow(
                     new Date(nextMatch?.times.estimatedStartTime || 0),
                  ).value}
            </div>
         </div>
      </div>
   );
}
