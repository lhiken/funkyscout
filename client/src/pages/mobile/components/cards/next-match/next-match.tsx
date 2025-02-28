import { useContext, useEffect, useState } from "react";
import styles from "./next-match.module.css";
import {
   getShiftsUntilBreak,
   getUserScoutingProgress,
} from "../../../../../lib/app/user-progression";
import { getNextAssignedMatch } from "../../../../../lib/app/helpers";
import {
   parseMatchKey,
   parseTeamKey,
   timeFromNow,
   to24HourTime,
} from "../../../../../utils/logic/app";
import { Tables } from "../../../../../lib/supabase/database.types";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";

export function MobileNextMatchCard() {
   const [shiftsDone, setShiftsDone] = useState(0);
   const [shiftsLeft, setShiftsLeft] = useState(0);
   const [shiftsToBreak, setShiftsToBreak] = useState(0);

   const globalData = useContext(GlobalTeamDataContext);

   const [nextMatch, setNextMatch] = useState<
      { data: Tables<"event_schedule">; time: number } | null
   >();

   useEffect(() => {
      getUserScoutingProgress().then((res) => {
         setShiftsDone(res.matchScouting.done);
         setShiftsLeft(res.matchScouting.assigned - res.matchScouting.done);
      });

      getNextAssignedMatch().then((res) => {
         setNextMatch(res);
      });

      getShiftsUntilBreak().then((res) => {
         setShiftsToBreak(res);
      });
   }, []);

   const nextMatchDateObject = nextMatch?.time
      ? new Date(nextMatch?.time)
      : new Date();

   return (
      <div className={styles.nextMatchContainer}>
         <div className={styles.nextMatchScoutStats}>
            <ScoutingStatCard value={shiftsDone + ""} title="shifts done" />
            <ScoutingStatCard value={shiftsLeft + ""} title="shifts left" />
            <ScoutingStatCard value={shiftsToBreak + ""} title="to break" />
         </div>
         <div className={styles.nextMatchDetails}>
            {nextMatch?.data
               ? (
                  <>
                     <div className={styles.nextMatchHeader}>
                        Next Match{" "}
                        <div style={{ color: "var(--text-secondary)" }}>|</div>
                        {" "}
                        <div style={{ color: "var(--primary)" }}>
                           {timeFromNow(nextMatchDateObject).value}{" "}
                           {timeFromNow(nextMatchDateObject).sign == "+"
                              ? "from now"
                              : "ago"}
                        </div>
                     </div>
                     <div className={styles.nextMatchTime}>
                        <i
                           style={{
                              color: "var(--surface)",
                              fontSize: "3.25rem",
                           }}
                           className="fa-regular fa-clock"
                        />
                        {to24HourTime(new Date(nextMatchDateObject))}
                     </div>
                     <div className={styles.nextMatchStartScouting}>
                        <div style={{ color: "var(--primary)" }}>
                           {parseMatchKey(
                              nextMatch?.data.match || "Loading...",
                              "nexus",
                           )}
                        </div>
                        <div style={{ display: "flex" }}>
                           {nextMatch?.data.team
                              ? "Team " +
                                 parseTeamKey(nextMatch?.data.team || "0")
                              : "Loading..."}&nbsp;
                           <div
                              style={{
                                 color: `${
                                    nextMatch?.data.alliance == "blue"
                                       ? "var(--blue-alliance)"
                                       : "var(--red-alliance)"
                                 }`,
                                 lineHeight: "1.25rem",
                                 fontSize: "2rem",
                              }}
                           >
                              •
                           </div>
                        </div>
                     </div>
                     <div className={styles.nextMatchTeamStats}>
                        <div className={styles.teamHeader}>
                           {nextMatch?.data.team
                              ? parseTeamKey(nextMatch?.data.team || "0")
                              : "N/A"}{" "}
                           <div style={{ color: "var(--text-background)" }}>
                              |
                           </div>
                           <div style={{ color: "var(--text-primary)" }}>
                              {globalData.TBAdata.find((val) =>
                                 val.key == nextMatch?.data.team
                              )?.name || "Loading..."}
                           </div>
                        </div>
                        <div className={styles.boxBottom}>
                           <div className={styles.stats}>
                              <div className={styles.statLine}>
                                 <div style={{ color: "var(--primary)" }}>
                                    Rank
                                 </div>
                                 <div>
                                    #{globalData.TBAdata.find((val) =>
                                       val.key == nextMatch?.data.team
                                    )?.rank || "N/A"}
                                 </div>
                              </div>
                              <div className={styles.statLine}>
                                 <div style={{ color: "var(--primary)" }}>
                                    EPA
                                 </div>
                                 <div>
                                    {globalData
                                          .EPAdata[
                                             parseTeamKey(
                                                nextMatch?.data.team || "",
                                             )
                                          ]
                                       ? globalData
                                          .EPAdata[nextMatch?.data.name || ""]
                                          .epa.total_points.mean
                                       : "N/A"}
                                 </div>
                              </div>
                           </div>
                           <i
                              style={{
                                 fontSize: "1.25rem",
                                 color: "var(--primary)",
                              }}
                              className="fa-solid fa-magnifying-glass"
                           />
                        </div>
                     </div>
                  </>
               )
               : (
                  <div className={styles.loadBox}>
                     No matches assigned
                  </div>
               )}
         </div>
      </div>
   );
}

function ScoutingStatCard({
   value,
   title,
}: {
   value: string;
   title: string;
}) {
   return (
      <div className={styles.scoutingStatCard}>
         <div className={styles.scoutingStatCardValue}>
            <div>{value.match(/\d+/g)?.join("")}</div>
            <div style={{ fontSize: "1.25rem" }}>
               {value.match(/\D+/g)?.join("")}
            </div>
         </div>
         <div className={styles.scoutingStatCardTitle}>
            {title}
         </div>
      </div>
   );
}
