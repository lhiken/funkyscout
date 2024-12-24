import { useContext, useState } from "react";
import styles from "./styles.module.css";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";
import MatchAssignmentCard from "./match-card";
import ScouterScheduleCard from "./user-card";
import { parseMatchKey } from "../../../../../utils/logic/app";

function ScheduleTable() {
   const scheduleData = useContext(ScheduleContext);
   const assignmentData = useContext(AssignmentContext);

   const [matchQuery] = useState();

   const queriedMatches = scheduleData?.val?.matchData
      ? (matchQuery
         ? Object.entries(scheduleData.val.matchData).map((
            [match, data],
         ) => ({
            match,
            ...data,
         })).filter((match) => match.match == matchQuery)
         : Object.entries(scheduleData.val.matchData).map((
            [match, data],
         ) => ({
            match,
            ...data,
         }))).filter((match) => match.match.includes("qm")).sort((a, b) =>
            a.est_time - b.est_time
         )
      : [];

   const [matchMode, setMatchMode] = useState(true);

   const [currentPage, setCurrentPage] = useState(0);
   const itemsPerPage = 5;

   const scouterList = assignmentData.val?.scouterList || [];

   const handleNext = () => {
      if ((currentPage + 1) * itemsPerPage < scouterList.length) {
         setCurrentPage(currentPage + 1);
      }
   };

   const handlePrevious = () => {
      if (currentPage > 0) {
         setCurrentPage(currentPage - 1);
      }
   };

   const currentScouters = scouterList.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage,
   );

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-calendar-day" />&nbsp;&nbsp;Schedule
            </div>
            <div
               className={styles.modeSelector}
               onClick={() => setMatchMode(!matchMode)}
            >
               {matchMode
                  ? (
                     <div className={styles.scheduleChangeButton}>
                        Match View <i className="fa-solid fa-caret-right" />
                     </div>
                  )
                  : (
                     <div className={styles.scheduleChangeButton}>
                        <i className="fa-solid fa-caret-left" /> Users View
                     </div>
                  )}
            </div>
         </div>
         {matchMode
            ? (
               <>
                  <div className={styles.titles}>
                     <div
                        style={{
                           width: "5rem",
                        }}
                     >
                        Match
                     </div>
                     <div
                        style={{
                           display: "flex",
                           flexGrow: "1",
                           justifyContent: "center",
                           gap: "1rem",
                        }}
                     >
                        <div
                           style={{
                              width: "100%",
                              textAlign: "center",
                           }}
                        >
                           Red Alliance
                        </div>
                        <div
                           style={{
                              width: "100%",
                              textAlign: "center",
                           }}
                        >
                           Blue Alliance
                        </div>
                     </div>
                     <div
                        style={{
                           width: "5rem",
                           textAlign: "right",
                        }}
                     >
                        Time
                     </div>
                  </div>
                  <div className={styles.seperator} />
                  <div className={styles.matchContainer}>
                     {queriedMatches.map((match, index) => {
                        return (
                           <MatchAssignmentCard
                              key={index}
                              matchData={match}
                           />
                        );
                     })}
                  </div>
                  {scheduleData?.val?.queryProgress.teamData.isLoading &&
                     (
                        <div className={styles.loadBox}>
                           Loading teams...
                        </div>
                     )}
                  {(scheduleData.val?.queryProgress.teamData.isError) && (
                     <div className={styles.loadBox}>
                        <i className="fa-regular fa-circle-xmark" />&nbsp;
                        Couldn't load teams
                     </div>
                  )}
                  {(!scheduleData.val?.queryProgress.teamData.isError &&
                     !scheduleData?.val?.queryProgress.teamData
                        .isLoading &&
                     Object.keys(scheduleData.val?.matchData || {})
                           .length ==
                        0) && (
                     <div className={styles.loadBox}>
                        <i className="fa-regular fa-circle-xmark" />&nbsp; No
                        matches found
                     </div>
                  )}
                  <div>
                  </div>
               </>
            )
            : (
               <>
                  <div className={styles.headerCards}>
                     <div className={styles.matchHeaderInfo}>Match</div>
                     <div className={styles.usersHeaderInfo}>
                        <div
                           className={styles.pageButton}
                           onClick={handlePrevious}
                        >
                           <i className="fa-solid fa-angle-left" />
                        </div>
                        <div className={styles.scouterHeaders}>
                           {currentScouters.map((scouter, index) => {
                              return (
                                 <div
                                    key={index}
                                    className={styles
                                       .userHeaderCard}
                                 >
                                    {scouter.name}
                                 </div>
                              );
                           })}
                        </div>
                        <div
                           className={styles.pageButton}
                           onClick={handleNext}
                        >
                           <i className="fa-solid fa-angle-right" />
                        </div>
                     </div>
                     <div
                        className={styles.headerTime}
                     >
                        Time
                     </div>
                  </div>{" "}
                  <div className={styles.seperator} />
                  <div className={styles.scouterCalendar}>
                     <div className={styles.matchesInfo}>
                        <div>
                           {Object.keys(
                              scheduleData.val?.matchData || {},
                           )
                              .filter((
                                 key,
                              ) => key.includes("qm")).sort((a, b) =>
                                 Number(
                                    a.substring(
                                       a.indexOf("qm") + 2,
                                    ),
                                 ) -
                                 Number(
                                    b.substring(
                                       a.indexOf("qm") + 2,
                                    ),
                                 )
                              ).map((key, index) => {
                                 return (
                                    <div
                                       key={index}
                                       className={styles
                                          .matchDetailCard}
                                    >
                                       <div
                                          style={{
                                             lineHeight: "2rem",
                                          }}
                                       >
                                          {parseMatchKey(
                                             key,
                                             "short",
                                          )
                                             .substring(0, 5)}
                                       </div>
                                       <div
                                          style={{
                                             fontFamily: "Ubuntu Mono",
                                             fontSize: "1.1rem",
                                             lineHeight: "2rem",
                                          }}
                                       >
                                          {parseMatchKey(
                                             key,
                                             "short",
                                          )
                                             .substring(5)}
                                       </div>
                                    </div>
                                 );
                              })}
                        </div>
                     </div>
                     <div className={styles.scoutersInfo}>
                        {currentScouters.map((scouter, index) => {
                           return (
                              <ScouterScheduleCard
                                 key={index}
                                 scouter={scouter}
                              />
                           );
                        })}
                     </div>
                     <div className={styles.matchesInfo}>
                        <div>
                           {Object.keys(
                              scheduleData.val?.matchData || {},
                           )
                              .filter((
                                 key,
                              ) => key.includes("qm")).sort((a, b) =>
                                 Number(
                                    a.substring(
                                       a.indexOf("qm") + 2,
                                    ),
                                 ) -
                                 Number(
                                    b.substring(
                                       a.indexOf("qm") + 2,
                                    ),
                                 )
                              ).map((key, index) => {
                                 return (
                                    <div
                                       key={index}
                                       className={styles
                                          .matchDetailCard}
                                       style={{
                                          display: "flex",
                                          justifyContent: "flex-end",
                                       }}
                                    >
                                       <div
                                          style={{
                                             fontFamily: "Ubuntu Mono",
                                             fontSize: "1.1rem",
                                             lineHeight: "2rem",
                                             textAlign: "left",
                                             color: "var(--text-secondary)",
                                          }}
                                       >
                                          {(new Date(
                                             scheduleData.val
                                                      ?.matchData &&
                                                   scheduleData
                                                         .val
                                                         ?.matchData[
                                                            key
                                                         ]
                                                         .est_time *
                                                      1000 ||
                                                "",
                                          )).toLocaleTimeString(
                                             undefined,
                                             {
                                                hour12: true,
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hourCycle: "h12",
                                             },
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                        </div>
                     </div>
                  </div>
               </>
            )}
      </div>
   );
}

export default ScheduleTable;
