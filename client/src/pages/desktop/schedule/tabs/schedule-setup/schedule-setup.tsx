import { useContext, useEffect, useState } from "react";
import styles from "./styles.module.css";
import { AnimatePresence, motion } from "motion/react";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";
import { Tables } from "../../../../../lib/supabase/database.types";
import Checkbox from "../../../../../components/app/buttons/checkbox";
import RoundInput from "../../../../../components/app/input/round-input";
import { assignUsersToTeams } from "./scheduler";
import { getEvent } from "../../../../../utils/logic/app";

function SetupPanel() {
   const scheduleData = useContext(ScheduleContext);
   const assignmentData = useContext(AssignmentContext);

   const [showInfo, setShowInfo] = useState(true);
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
      console.log(scheduleData.val?.matchData || []);
      console.log(assignmentData.val?.priorityTeams || []);
      console.log(assignmentData.val?.scouterList || []);
   }

   function handleScheduleTeams() {
      if (assignmentData.setVal) {
         assignmentData.setVal((prev) => ({
            ...prev,
            teamData: assignUsersToTeams(
               scheduleData.val?.teamData
                  ? scheduleData.val?.teamData.map((team) => team.key)
                  : [],
               assignmentData.val?.scouterList || [],
               getEvent() || "",
            ),
         }));
      }
   }

   const [hasRendered, setHasRendered] = useState(false);

   useEffect(() => {
      setHasRendered(true);
   }, []);

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
                     initial={hasRendered ? { height: 0, opacity: 0 } : false} // Skip initial animation on first render
                     animate={{ height: "10.25rem", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="infoContent"
                  >
                     <div
                        className={styles.seperator}
                        style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
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
               Scouter List
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

   const optionsPage = (
      <div className={styles.content}>
         <div className={styles.assignSettings}>
            <div className={styles.header}>
               Assignment Options
            </div>
            <div className={styles.seperator} />
            <div className={styles.option}>
               Max total shifts
            </div>
            <div className={styles.option}>
               Min consec. shifts
            </div>
            <div className={styles.option}>
               Min consec. shifts
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
               Scouter List
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
               {assignmentData.val?.scouterList.map((user, index) => {
                  return (
                     <div key={index} className={styles.scouterEntry}>
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
                  );
               })}
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
            <div className={styles.saveButton}>
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
                  scouter.name === user.name && scouter.uid === user.uid,
            ) || false}
         />
      </div>
   );
}

export default SetupPanel;
