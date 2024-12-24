import { useContext, useEffect, useState } from "react";
import TeamEPAChart from "./cards/chart/epa-chart";
import styles from "./styles.module.css";
import {
   TeamDataContext,
   TeamDataProgressContext,
} from "../dashboard-team-context";
import { getEvent, getFocusTeam } from "../../../../utils/logic/app";
import { useQueries } from "@tanstack/react-query";
import { fetchTeamEventStatus } from "../../../../lib/tba/teams";
import InfoCard from "./cards/info-card/card";
import { getNexusEventStatus } from "../../../../lib/nexus/events";

function InfoTab() {
   const teamData = useContext(TeamDataContext);
   const teamDataProgress = useContext(TeamDataProgressContext);

   const [teamStatusResult, eventStatusResult] = useQueries({
      queries: [
         {
            queryKey: ["dashboardTeamInfoFetchTeamStatus"],
            queryFn: () =>
               fetchTeamEventStatus(
                  getEvent() || "",
                  "frc" + getFocusTeam() || "",
               ),
            refetchInterval: 120 * 1000,
            refetchOnWindowFocus: false,
         },
         {
            queryKey: ["dashboardTeamInfoFetchNexusStatus"],
            queryFn: () => getNexusEventStatus("demo8631"),
            refetchInterval: 60 * 1000,
            refetchOnWindowFocus: false,
         },
      ],
   });

   const [updateStatus, setUpdateStatus] = useState<string>(
      `Updating... ${teamDataProgress.fetched}/${teamDataProgress.total}`,
   );

   const teamStatus = teamStatusResult.data;
   const eventStatus = eventStatusResult.data;
   const eventIsPending = eventStatusResult.isPending;
   const eventError = eventStatusResult.error;

   function formatTime(time: number) {
      const diffInMs = Date.now() - time; // Get the difference in milliseconds

      const seconds = Math.floor(diffInMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) {
         return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
      } else if (minutes < 60) {
         return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      } else if (hours < 24) {
         return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else {
         return `${days} day${days !== 1 ? "s" : ""} ago`;
      }
   }

   useEffect(() => {
      const updateInterval = setInterval(() => {
         setUpdateStatus(
            teamDataProgress.fetchTime && teamDataProgress.fetchTime > 0
               ? `EPAs updated ${formatTime(teamDataProgress.fetchTime)}`
               : `Updating... ${teamDataProgress.fetched}/${teamDataProgress.total}`,
         );
      }, 100);

      return () => clearInterval(updateInterval);
   }, [teamDataProgress]);

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-chart-line" />&nbsp;&nbsp; Event
               Information
            </div>
            <div className={styles.updateTime}>
               {updateStatus}&nbsp;<i
                  className="fa-solid fa-arrows-rotate"
                  style={{ cursor: "pointer" }}
               />
            </div>
         </div>
         <div className={styles.content}>
            <TeamEPAChart />
            <div className={styles.cards}>
               <InfoCard
                  title="Team Performance"
                  contents={[
                     {
                        title: "Rank",
                        content: teamStatus &&
                              teamStatus?.rank
                                 ?.toString() || "N/A",
                     },
                     {
                        title: "EPA",
                        content: teamData
                           ? teamData["frc" + getFocusTeam()]
                              ? teamData["frc" + getFocusTeam()].epa
                                 .total_points
                                 .mean.toFixed(1)
                              : "N/A"
                           : "N/A",
                     },
                     {
                        title: "RP",
                        content: teamStatus &&
                              (teamStatus.orders[0] * 10)
                                 .toFixed(0) ||
                           "N/A",
                     },
                  ]}
                  icon={<i className="fa-solid fa-gauge-high" />}
               />
               <InfoCard
                  title="Team Record"
                  contents={[
                     {
                        title: "Wins",
                        content: teamStatus
                           ? teamStatus.record.wins.toString()
                           : "N/A",
                     },
                     {
                        title: "Ties",
                        content: teamStatus
                           ? teamStatus.record.ties.toString()
                           : "N/A",
                     },
                     {
                        title: "Loss",
                        content: teamStatus
                           ? teamStatus.record.losses.toString()
                           : "N/A",
                     },
                  ]}
                  icon={<i className="fa-solid fa-scroll" />}
               />
               <div className={styles.announcementsBox}>
                  <div className={styles.announcementsHeader}>
                     Announcements{" "}
                     <div className={styles.icon}>
                        <i className="fa-solid fa-bullhorn" />
                     </div>
                  </div>
                  <div className={styles.announcementContainer}>
                     {eventStatus &&
                        eventStatus.announcements.length > 0 &&
                        eventStatus.announcements.sort((a, b) =>
                           b.postedTime - a.postedTime
                        ).map((announcement, index) => (
                           <div
                              key={index}
                              className={styles.announcement}
                           >
                              <div
                                 className={styles.announcementTime}
                                 style={{
                                    color: "var(--text-secondary)",
                                 }}
                              >
                                 {formatTime(
                                    announcement.postedTime,
                                 )}
                              </div>
                              {announcement.announcement}
                           </div>
                        ))}
                     {eventIsPending && (
                        <div className={styles.announcementsInfoBox}>
                           Loading announcements...
                        </div>
                     )}
                     {((!eventStatus && !eventIsPending) ||
                        eventError) && (
                        <div className={styles.announcementsInfoBox}>
                           Couldn't load announcements
                        </div>
                     )}
                     {!eventIsPending && !eventError && eventStatus &&
                        eventStatus.announcements.length == 0 && (
                        <div className={styles.announcementsInfoBox}>
                           There are no announcements!
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default InfoTab;
