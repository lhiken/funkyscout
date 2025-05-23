import { useContext, useEffect, useState } from "react";
import styles from "./styles.module.css";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";
import { Tables } from "../../../../../lib/supabase/database.types";
import Checkbox from "../../../../../components/app/buttons/checkbox";
import RoundInput from "../../../../../components/app/input/round-input";
import { assignUsersToMatches, assignUsersToTeams } from "./scheduler";
import { getEvent } from "../../../../../utils/logic/app";
import {
   setupEventTeamList,
   uploadMatchAssignments,
   uploadTeamAssignments,
} from "../../../../../lib/supabase/setup";
import throwNotification from "../../../../../components/app/toast/toast";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";

function SetupPanel() {
   const scheduleData = useContext(ScheduleContext);
   const assignmentData = useContext(AssignmentContext);

   const [showInfo, setShowInfo] = useState(false);
   const [userQuery, setUserQuery] = useState("");

   const queriedUsers = scheduleData?.val?.userData
      ? userQuery == ""
         ? scheduleData.val.userData
         : scheduleData.val.userData.filter((user) =>
            user.name.toLowerCase().includes(userQuery.toLowerCase())
         )
      : [];

   const [showOptions, setShowOptions] = useState(false);

   function handleScheduleMatches() {
      if (assignmentData.setVal) {
         const t0 = performance.now();
         const updatedMatchData = assignUsersToMatches(
            scheduleData.val?.matchData || {},
            assignmentData.val?.priorityTeams || [],
            assignmentData.val?.lowPriorityTeams || [],
            assignmentData.val?.scouterList.reverse() || [],
            Number(maxConsecShifts),
            Number(breakLength),
            getEvent() || "",
         );
         const t1 = performance.now();

         throwNotification(
            "info",
            `Assigned shifts in ${Math.round((t1 - t0) * 10) / 10} ms`,
         );

         assignmentData.setVal((prev) => ({
            ...prev,
            matchData: updatedMatchData,
         }));

         setupEventTeamList(getEvent() || "");
      }
   }

   const globalData = useContext(GlobalTeamDataContext);

   function handleScheduleTeams() {
      if (assignmentData.setVal) {
         const teamKeys = globalData.TBAdata.map((val) => val.key) ||
            [];
         const scouterList = assignmentData.val?.scouterList || [];
         const event = getEvent() || "";
         console.log(teamKeys);

         const updatedTeamData = assignUsersToTeams(
            teamKeys,
            scouterList,
            event,
         );

         assignmentData.setVal((prev) => ({
            ...prev,
            teamData: updatedTeamData,
         }));
      }
   }

   const [hasRendered, setHasRendered] = useState(false);

   useEffect(() => {
      setHasRendered(true);
   }, []);

   function handleSaveShifts() {
      throwNotification("info", "Saving shift assignments...");
      uploadTeamAssignments(assignmentData.val?.teamData || []).then((res) => {
         if (res) {
            uploadMatchAssignments(assignmentData.val?.matchData || []).then(
               (res) => {
                  if (res) {
                     throwNotification(
                        "success",
                        "Successfully saved assignments",
                     );
                  } else {
                     throwNotification(
                        "error",
                        "Could not save shift assignments",
                     );
                  }
               },
            );
         } else {
            throwNotification("error", "Could not save shift assignments");
         }
      });
   }

   const setupPage = (
      <div className={styles.content}>
         <div
            className={styles.infoBox}
            onClick={() => setShowInfo(!showInfo)}
         >
            <div className={styles.header}>
               Info
               <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <AnimatePresence>
               {showInfo && (
                  <motion.div
                     initial={hasRendered ? { height: 0, opacity: 0 } : false}
                     animate={{ height: "12rem", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="infoContent"
                  >
                     <div
                        className={styles.seperator}
                        style={{
                           marginBottom: "0.75rem",
                           marginTop: "0.25rem",
                        }}
                     />
                     Before proceeding, first set up the event and choose which
                     scouters you want to assign shifts to. <br />
                     <br /> If this has already been done, you can move on.
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
         <div className={styles.scoutersBox}>
            <div className={styles.header}>
               Scouter List{" "}
               <div style={{ color: "var(--text-secondary)" }}>
                  {assignmentData.val?.scouterList.length}
               </div>
            </div>
            <RoundInput
               value={userQuery}
               setValue={setUserQuery}
               placeholder="Search users..."
               type="text"
               cornerStyle="sharp"
               style={{
                  height: "3.25rem",
                  backgroundColor: "var(--inset)",
                  border: "2px solid var(--text-background)",
               }}
               icon={<i className="fa-solid fa-magnifying-glass" />}
               iconActive={true}
            />{" "}
            <div className={styles.scouterList}>
               {queriedUsers.map((user, index) => {
                  return <ScouterCard key={index} user={user} />;
               })}
            </div>
         </div>
         <div
            className={styles.uploadButton}
            onClick={() => setShowOptions(true)}
         >
            Continue{" "}
            <div>
               <i className="fa-solid fa-arrow-right" />
            </div>
         </div>
      </div>
   );

   const [maxConsecShifts, setMaxConsecShifts] = useState("6");
   const [breakLength, setBreakLength] = useState("4");

   // New state to track the order of scouters
   const [scouterOrder, setScouterOrder] = useState<{
      name: string;
      uid: string;
   }[]>([]);

   // Update the scouter order when assignmentData changes
   useEffect(() => {
      if (
         assignmentData.val?.scouterList &&
         assignmentData.val.scouterList.length > 0
      ) {
         setScouterOrder(assignmentData.val.scouterList);
      }
   }, [assignmentData.val?.scouterList]);

   // Handle reordering of scouters
   const handleReorder = (newOrder: {
      name: string;
      uid: string;
   }[]) => {
      setScouterOrder(newOrder);

      // Update the context with the new order
      if (assignmentData.setVal) {
         assignmentData.setVal((prev) => ({
            ...prev,
            scouterList: newOrder,
         }));
      }
   };

   const optionsPage = (
      <div className={styles.content}>
         <div className={styles.assignSettings}>
            <div className={styles.header}>
               Assignment Options
            </div>
            <div className={styles.seperator} />
            <div className={styles.option}>
               Max shift length
               <input
                  className={styles.input}
                  type="text"
                  value={maxConsecShifts}
                  onChange={(val) => setMaxConsecShifts(val.target.value)}
                  placeholder={"~"}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  maxLength={2}
               />
            </div>
            <div className={styles.option}>
               Min break length
               <input
                  className={styles.input}
                  type="text"
                  value={breakLength}
                  onChange={(val) => setBreakLength(val.target.value)}
                  placeholder={"~"}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  maxLength={2}
               />
            </div>
         </div>
         <div
            className={styles.assignButton}
            onClick={handleScheduleMatches}
         >
            Schedule Matches
            <div style={{ color: "var(--primary)" }}>
               <i className="fa-solid fa-calendar-day" />
            </div>
         </div>
         <div
            className={styles.assignButton}
            onClick={handleScheduleTeams}
         >
            Schedule Teams
            <div style={{ color: "var(--primary)" }}>
               <i className="fa-solid fa-bars-staggered" />
            </div>
         </div>
         <div className={styles.scoutersBox}>
            <div className={styles.header}>
               Scouter List<div style={{ color: "var(--text-secondary)" }}>
                  {assignmentData.val?.scouterList.length}
               </div>
            </div>
            <div className={styles.seperator} />
            <div className={styles.scouterList}>
               <div
                  className={styles.scouterEntry}
                  style={{ color: "var(--text-secondary)" }}
               >
                  <div>Scouter Name</div>
                  <div
                     className={styles.scouterMatches}
                     style={{ color: "var(--text-secondary)" }}
                  >
                     M
                     <div>|</div>
                     T
                  </div>
               </div>
               <Reorder.Group
                  as="div"
                  axis="y"
                  values={scouterOrder}
                  onReorder={handleReorder}
                  style={{
                     width: "100%",
                     listStyle: "none",
                     padding: 0,
                     margin: 0,
                  }}
               >
                  {scouterOrder.map((user) => (
                     <Reorder.Item
                        key={user.uid}
                        value={user}
                        style={{
                           cursor: "grab",
                           width: "100%",
                           touchAction: "none",
                        }}
                     >
                        <div className={styles.scouterEntry}>
                           <div>{user.name}</div>
                           <div className={styles.scouterMatches}>
                              {assignmentData.val?.matchData.filter((val) =>
                                 val.uid == user.uid
                              ).length}
                              <div>|</div>
                              {assignmentData.val?.teamData.filter((val) =>
                                 val.assigned == user.uid
                              ).length}
                           </div>
                        </div>
                     </Reorder.Item>
                  ))}
               </Reorder.Group>
            </div>
         </div>
         <div className={styles.buttons}>
            <div
               className={styles.backButton}
               onClick={() => setShowOptions(false)}
            >
               <div>
                  <i className="fa-solid fa-arrow-left" />
               </div>
            </div>
            <div className={styles.saveButton} onClick={handleSaveShifts}>
               Save shifts
               <div>
                  <i
                     className="fa-solid fa-floppy-disk"
                     style={{ color: "var(--primary)" }}
                  />
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-toolbox" />&nbsp;&nbsp;Event Setup
            </div>
         </div>
         {!showOptions ? setupPage : optionsPage}
      </div>
   );
}

function ScouterCard({ user }: { user: Tables<"user_profiles"> }) {
   const assignmentData = useContext(AssignmentContext);

   return (
      <div
         className={styles.scouterCard}
         onClick={() => {
            if (assignmentData && assignmentData.setVal) {
               assignmentData.setVal((prev) => ({
                  ...prev,
                  scouterList:
                     prev.scouterList.some((scouter) =>
                           scouter.uid === user.uid
                        )
                        ? prev.scouterList.filter((scouter) =>
                           scouter.uid !== user.uid
                        )
                        : [...prev.scouterList, {
                           name: user.name,
                           uid: user.uid,
                        }],
               }));
            }
         }}
      >
         {user.name}
         <Checkbox
            enabled={assignmentData.val?.scouterList.some(
               (scouter) =>
                  scouter.name == user.name || scouter.uid == user.uid,
            ) || false}
         />
      </div>
   );
}

export default SetupPanel;
