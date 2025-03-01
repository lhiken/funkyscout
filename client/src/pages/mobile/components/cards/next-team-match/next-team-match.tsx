import { useContext, useEffect, useState } from "react";
import styles from "./next-team-match.module.css";
import {
   getNexusEventStatus,
   NexusMatch,
} from "../../../../../lib/nexus/events";
import {
   getEvent,
   getFocusTeam,
   parseTeamKey,
   timeFromNow,
} from "../../../../../utils/logic/app";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";
import { navigate } from "wouter/use-browser-location";

export function MobileNextTeamMatchCard() {
   const [nextMatch, setNextMatch] = useState<NexusMatch>();

   async function getNextMatch() {
      const data = await getNexusEventStatus(getEvent() || "");
      if (data) {
         const nextMatch = data.matches.filter((val) => {
            if (!val?.blueTeams || !val?.redTeams) return false;
            return [...val.blueTeams, ...val.redTeams].includes(
               parseTeamKey(getFocusTeam() || "846"),
            );
         })
            .reduce((closest, current) => {
               const currentTime = Date.now();
               const currentStartTime = new Date(
                  current.times.estimatedStartTime,
               ).getTime();
               const closestStartTime = new Date(
                  closest.times.estimatedStartTime,
               ).getTime();

               if (currentStartTime < currentTime) return closest;
               if (closestStartTime < currentTime) return current;
               return Math.abs(currentStartTime - currentTime) <
                     Math.abs(closestStartTime - currentTime)
                  ? current
                  : closest;
            });

         console.log(nextMatch);
         setNextMatch(nextMatch);
      } else {
         return false;
      }
   }

   useEffect(() => {
      getNextMatch();
   }, []);

   const EPAdata = useContext(GlobalTeamDataContext).EPAdata;
   const blueTotal = getEPA(nextMatch?.blueTeams[0]) +
      getEPA(nextMatch?.blueTeams[1]) + getEPA(nextMatch?.blueTeams[2]);
   const redTotal = getEPA(nextMatch?.redTeams[0]) +
      getEPA(nextMatch?.redTeams[1]) + getEPA(nextMatch?.redTeams[2]);

   function getEPA(team: string | undefined) {
      if (team && EPAdata["frc" + team]) {
         return EPAdata["frc" + team].epa.total_points.mean;
      } else {
         return 0;
      }
   }

   return (
      <div className={styles.container}>
         {nextMatch
            ? (
               <>
                  <div className={styles.header}>
                     Next Match {"(846)"}
                     <div style={{ color: "var(--text-background)" }}>|</div>
                     {" "}
                     <div style={{ color: "var(--text-primary)" }}>
                        {nextMatch?.label + " - " +
                           timeFromNow(
                              new Date(
                                 nextMatch?.times.estimatedStartTime || 0,
                              ),
                           ).value}
                        {timeFromNow(
                              new Date(
                                 nextMatch?.times.estimatedStartTime || 0,
                              ),
                           ).sign == "-"
                           ? " ago"
                           : ""}
                     </div>
                  </div>
                  <div className={styles.content}>
                     <div className={styles.teams}>
                        <div className={styles.blueAlliance}>
                           <TeamButton teamNumber={nextMatch?.blueTeams[0]} />
                           <TeamButton teamNumber={nextMatch?.blueTeams[1]} />
                           <TeamButton teamNumber={nextMatch?.blueTeams[2]} />
                        </div>
                        <div className={styles.redAlliance}>
                           <TeamButton teamNumber={nextMatch?.redTeams[0]} />
                           <TeamButton teamNumber={nextMatch?.redTeams[1]} />
                           <TeamButton teamNumber={nextMatch?.redTeams[2]} />
                        </div>
                     </div>
                     <div className={styles.matchDetails}>
                        <div className={styles.matchStatus}>
                           {nextMatch?.status}
                        </div>
                        <div className={styles.matchEstimate}>
                           Score Estimate
                           <div className={styles.winCard}>
                              <div>{blueTotal > redTotal ? "BLUE" : "RED"}</div>
                              <div style={{ display: "flex", gap: "0.25rem" }}>
                                 <div style={{ color: "var(--blue-alliance)" }}>
                                    {blueTotal.toFixed(0)}
                                 </div>{" "}
                                 -{" "}
                                 <div style={{ color: "var(--red-alliance)" }}>
                                    {redTotal.toFixed(0)}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </>
            )
            : (
               <div className={styles.loadBox}>
                  Loading match details...
               </div>
            )}
      </div>
   );
}

function TeamButton({ teamNumber }: { teamNumber: string | undefined }) {
   return (
      <div
         style={{
            color: teamNumber == getFocusTeam()
               ? "var(--primary)"
               : "var(--text-primary)",
         }}
         onClick={() => navigate(`/m/data/team/frc${teamNumber}`)}
      >
         {teamNumber}
      </div>
   );
}
