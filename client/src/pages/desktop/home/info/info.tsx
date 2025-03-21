import { useContext } from "react";
import TeamEPAChart from "./cards/chart/epa-chart";
import styles from "./styles.module.css";

import { getEvent, getFocusTeam } from "../../../../utils/logic/app";
import { useQueries } from "@tanstack/react-query";
import { fetchTeamEventStatus } from "../../../../lib/tba/teams";
import InfoCard from "./cards/info-card/card";
import { getNexusEventStatus } from "../../../../lib/nexus/events";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";

function InfoTab() {
   const teamData = useContext(GlobalTeamDataContext)?.EPAdata || {};

   const [teamStatusResult, eventStatusResult] = useQueries({
      queries: [
         {
            queryKey: ["dashboardTeamInfoFetchTeamStatus"],
            queryFn: () =>
               fetchTeamEventStatus(
                  getEvent() || "",
                  "frc" + (getFocusTeam() || ""),
               ),
            refetchInterval: 120 * 1000,
            refetchOnWindowFocus: false,
         },
         {
            queryKey: ["dashboardTeamInfoFetchNexusStatus"],
            queryFn: () => getNexusEventStatus(getEvent() || ""),
            refetchInterval: 60 * 1000,
            refetchOnWindowFocus: false,
         },
      ],
   });

   const teamStatus = teamStatusResult?.data || null;
   const eventStatus = eventStatusResult?.data || null;
   const eventIsPending = eventStatusResult?.isPending || false;
   const eventError = eventStatusResult?.error || null;

   function formatTime(time: number) {
      const diffInMs = Date.now() - time;
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

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-chart-line" />&nbsp;&nbsp; Event
               Information
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
                        content: teamStatus?.rank?.toString() || "N/A",
                     },
                     {
                        title: "EPA",
                        content: teamData?.["frc" + getFocusTeam()]?.epa
                           ?.total_points?.mean?.toFixed(1) || "N/A",
                     },
                     {
                        title: "RP",
                        content: teamStatus?.orders?.[0] != null
                           ? (teamStatus.orders[0] * 10).toFixed(0)
                           : "N/A",
                     },
                  ]}
                  icon={<i className="fa-solid fa-gauge-high" />}
               />
               <InfoCard
                  title="Team Record"
                  contents={[
                     {
                        title: "Wins",
                        content: teamStatus?.record?.wins?.toString() || "N/A",
                     },
                     {
                        title: "Ties",
                        content: teamStatus?.record?.ties?.toString() || "N/A",
                     },
                     {
                        title: "Loss",
                        content: teamStatus?.record?.losses?.toString() ||
                           "N/A",
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
                     {eventStatus?.announcements?.length || 0 > 0
                        ? (
                           eventStatus?.announcements
                              .sort((a, b) => b.postedTime - a.postedTime)
                              .map((announcement, index) => (
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
                                       {formatTime(announcement.postedTime)}
                                    </div>
                                    {announcement.announcement}
                                 </div>
                              ))
                        )
                        : eventIsPending
                        ? (
                           <div className={styles.announcementsInfoBox}>
                              Loading announcements...
                           </div>
                        )
                        : eventError || eventStatus === null ||
                              eventStatus === undefined
                        ? (
                           <div className={styles.announcementsInfoBox}>
                              Couldn't load announcements
                           </div>
                        )
                        : (
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
