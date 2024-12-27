import { useContext, useEffect } from "react";
import styles from "./comparison.module.css";
import {
   ComparedTeamKeysContext,
   PicklistCommandContext,
   TargetPicklistContext,
} from "../picklists-context";
import {
   AnimatePresence,
   motion,
   Reorder,
   useDragControls,
} from "motion/react";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";
import { parseTeamKey } from "../../../../utils/logic/app";
import Tippy from "@tippyjs/react";

function ComparisonTab() {
   const targetPicklist = useContext(TargetPicklistContext);
   const comparedTeams = useContext(ComparedTeamKeysContext);

   return (
      <div className={styles.container}>
         {!targetPicklist.val &&
            (
               <div className={styles.errorBox}>
                  Choose a picklist to get started
               </div>
            )}
         {!targetPicklist.val || comparedTeams.val?.length == 0 &&
               (
                  <div className={styles.errorBox}>
                     Choose a team to see its stats
                  </div>
               )}
         {targetPicklist.val && comparedTeams.val &&
            comparedTeams.val?.length > 0 && (
            <>
               <ComparedTeams />
               <TeamGraphs />
            </>
         )}
      </div>
   );
}

function ComparedTeams() {
   const focusTeams = useContext(ComparedTeamKeysContext);

   useEffect(() => {
      if (focusTeams.val && focusTeams.setVal) {
         const maximizedTeams = focusTeams.val.filter((val) => !val.minimized);

         let newTeams = [...focusTeams.val];

         if (maximizedTeams.length > 2) {
            const lastMaximizedTeamKey =
               maximizedTeams[maximizedTeams.length - 1].teamKey;

            newTeams = newTeams.map((val) =>
               val.teamKey === lastMaximizedTeamKey
                  ? { ...val, minimized: true }
                  : val
            );
         }

         if (newTeams.length > 4) {
            const lastMinimizedIndex = newTeams
               .map((val, index) => ({ ...val, index }))
               .filter((val) => val.minimized)
               .slice(-1)[0]?.index;

            if (lastMinimizedIndex !== undefined) {
               newTeams.splice(lastMinimizedIndex, 1);
            }
         }

         focusTeams.setVal(newTeams);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [focusTeams.val?.length]);

   if (!focusTeams.val || !focusTeams.setVal) return;

   const teams = focusTeams.val.slice().sort((a, b) =>
      Number(a.minimized) - Number(b.minimized)
   );

   return (
      <Reorder.Group
         axis="x"
         values={focusTeams.val}
         onReorder={focusTeams.setVal}
         className={styles.comparedTeamsContainer}
         as="div"
      >
         {teams.map((val) => {
            return <ComparedTeamElement key={val.teamKey} team={val} />;
         })}
      </Reorder.Group>
   );
}

function ComparedTeamElement(
   { team }: { team: { teamKey: string; minimized: boolean } },
) {
   const focusTeams = useContext(ComparedTeamKeysContext);
   const picklistCommands = useContext(PicklistCommandContext);
   const controls = useDragControls();

   const teamData = useContext(GlobalTeamDataContext).TBAdata.find((val) =>
      val.key == team.teamKey
   );

   function handleMinimizeToggle() {
      if (focusTeams.setVal && focusTeams.val) {
         const numOfMax = focusTeams.val.filter((val) => !val.minimized).length;

         focusTeams.setVal((prev) => [
            ...prev.filter((val) => val.teamKey != team.teamKey),
            {
               teamKey: team.teamKey,
               minimized: numOfMax < 3 && team.minimized
                  ? !team.minimized
                  : true,
            },
         ]);
      }
   }

   function handleMoveUp() {
      picklistCommands.moveTeamUp(team.teamKey);
   }

   function handleMoveDown() {
      picklistCommands.moveTeamDown(team.teamKey);
   }

   function handleExclude() {
      picklistCommands.excludeTeam(team.teamKey);
   }

   return (
      <Reorder.Item
         key={team.teamKey}
         value={team}
         dragListener={false}
         dragControls={controls}
         as="div"
         className={team.minimized
            ? styles.comparedTeamsMinimized
            : styles.comparedTeamElement}
      >
         {!team.minimized && (
            <div className={styles.teamHeader}>
               <div
                  className={styles.teamHeaderText}
                  onPointerDown={(e) => controls.start(e)}
               >
                  <div>
                     <i className="fa-solid fa-grip-vertical" />
                  </div>&nbsp;
                  <div
                     style={{
                        display: "flex",
                        gap: "0.2rem",
                     }}
                  >
                     {parseTeamKey(team.teamKey)}
                     <div style={{ color: "var(--text-secondary)" }}>|</div>
                     {" "}
                     <div
                        style={{
                           whiteSpace: "nowrap",
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                           width:
                              (focusTeams.val && focusTeams.val?.filter((val) =>
                                       !val.minimized
                                    ).length < 3
                                 ? "12rem"
                                 : "8rem"),
                        }}
                     >
                        {teamData ? teamData.name : "N/A"}
                     </div>
                  </div>
               </div>
               <div className={styles.elementOptions}>
                  <Tippy content="Move up">
                     <i
                        className={`fa-solid fa-arrow-up ${styles.elementOptionButton}`}
                        onClick={handleMoveUp}
                     />
                  </Tippy>
                  <Tippy content="Move down">
                     <i
                        className={`fa-solid fa-arrow-down ${styles.elementOptionButton}`}
                        onClick={handleMoveDown}
                     />
                  </Tippy>
                  <Tippy content="Exclude">
                     <i
                        className={`fa-solid fa-ban ${styles.elementOptionButton}`}
                        onClick={handleExclude}
                     />
                  </Tippy>{" "}
                  <Tippy content="Minimize tab">
                     <i
                        className={`fa-solid fa-compress ${styles.elementOptionButton}`}
                        onClick={handleMinimizeToggle}
                     />
                  </Tippy>
               </div>
            </div>
         )}
         <AnimatePresence>
            {team.minimized && (
               <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                     duration: 0.4,
                     ease: "easeIn",
                  }}
                  className={styles.minimizedContainer}
               >
                  <Tippy
                     content={`${parseTeamKey(team.teamKey)} | ${
                        teamData ? teamData.name : "N/A"
                     }`}
                     placement="left"
                  >
                     <div
                        className={styles.teamName}
                        onPointerDown={(e) => controls.start(e)}
                     >
                        <div>
                           <i
                              className={`fa-solid fa-grip ${styles.gripControl}`}
                           />
                        </div>
                        {parseTeamKey(team.teamKey)} <div>|</div>{" "}
                        {teamData ? teamData.name : "N/A"}
                     </div>
                  </Tippy>

                  <div className={styles.elementOptionsMinimized}>
                     <Tippy content="Exclude" placement="left">
                        <i
                           className={`fa-solid fa-ban ${styles.elementOptionButton} ${styles.minimized}`}
                           onClick={handleExclude}
                        />
                     </Tippy>
                     <Tippy content="Move up" placement="left">
                        <i
                           className={`fa-solid fa-arrow-up ${styles.elementOptionButton} ${styles.minimized}`}
                           onClick={handleMoveUp}
                        />
                     </Tippy>
                     <Tippy content="Move down" placement="left">
                        <i
                           className={`fa-solid fa-arrow-down ${styles.elementOptionButton} ${styles.minimized}`}
                           onClick={handleMoveDown}
                        />
                     </Tippy>
                     <Tippy content="Minimize tab" placement="left">
                        <i
                           className={`fa-solid fa-expand ${styles.elementOptionButton} ${styles.minimized}`}
                           onClick={handleMinimizeToggle}
                        />
                     </Tippy>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </Reorder.Item>
   );
}

function TeamGraphs() {
   return (
      <div className={styles.teamGraphsContainer}>
      </div>
   );
}

export default ComparisonTab;
