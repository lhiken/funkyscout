import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import styles from "./picklist-tab.module.css";
import {
   ComparedTeamKeysContext,
   PicklistCommandContext,
   PicklistDataContext,
   TargetPicklistContext,
} from "../picklists-context";
import RoundInput from "../../../../components/app/input/round-input";
import { Tables } from "../../../../lib/supabase/database.types";
import Tippy from "@tippyjs/react";
import { getLocalUserData } from "../../../../lib/supabase/auth";
import { getEvent, parseTeamKey } from "../../../../utils/logic/app";
import {
   fetchTeamsByEvent,
   updatePicklist,
} from "../../../../lib/supabase/data";
import throwNotification from "../../../../components/app/toast/toast";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { Picklist } from "../../../../schemas/defs";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";
import { Reorder } from "motion/react";
import Checkbox from "../../../../components/app/buttons/checkbox";
import { setCurrentPicklist } from "../picklist-state-handler";

function PicklistTab() {
   const targetPicklist = useContext(TargetPicklistContext);
   const picklistCommands = useContext(PicklistCommandContext);

   const inputRef = useRef(null);
   const [inputWidth, setInputWidth] = useState(0);

   //just pretend this isnt even here, i dont even know what it does
   useEffect(() => {
      if (inputRef.current) {
         const span = document.createElement("span");
         span.style.font = getComputedStyle(inputRef.current).font;
         span.textContent = (targetPicklist.val?.title || "") + " ";

         document.body.appendChild(span);
         setInputWidth(span.offsetWidth);
         document.body.removeChild(span);
      }
   }, [targetPicklist.val]);

   function handleInputChange(input: ChangeEvent<HTMLInputElement>) {
      if (targetPicklist.setVal && targetPicklist.val) {
         let newTitle = input.target.value;

         if (newTitle.trim().length == 0) {
            newTitle = "";
         }

         if (newTitle.length > 26) {
            newTitle = targetPicklist.val.title;
         }

         picklistCommands.renamePicklist(newTitle);
      }
   }

   const [showSettings, setShowSettings] = useState(false);

   return (
      <div className={styles.container}>
         <div className={styles.containerHeader}>
            {!targetPicklist.val
               ? (
                  <>
                     <i className="fa-solid fa-list-ul" />
                     &nbsp; Picklists
                  </>
               )
               : (
                  <>
                     <div className={styles.headerElements}>
                        <div>
                           <i className="fa-solid fa-list-ul" />
                           &nbsp;{" "}
                           <div
                              style={{
                                 position: "relative",
                                 display: "inline-block",
                                 height: "1.25rem",
                              }}
                           >
                              <input
                                 ref={inputRef}
                                 type="text"
                                 placeholder="Picklist name..."
                                 value={targetPicklist.val.title}
                                 onChange={handleInputChange}
                                 style={{
                                    textDecoration: "none",
                                    border: "none",
                                    outline: "none",
                                    fontSize: "inherit",
                                    paddingBottom: "3px",
                                    width: `${
                                       inputWidth > 0 ? inputWidth + 20 : 120
                                    }px`,
                                    maxWidth: "14rem",
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                 }}
                              />
                              <div
                                 style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    border: "1px dashed var(--text-secondary)",
                                    width: `${inputWidth}px`,
                                    maxWidth: "14rem",
                                    display: `${
                                       inputWidth == 0 ? "none" : "block"
                                    }`,
                                 }}
                              />
                           </div>
                        </div>{" "}
                        <div
                           className={styles.settingsIcon}
                           onClick={() => setShowSettings(!showSettings)}
                        >
                           <i className="fa-solid fa-gear" />
                        </div>
                     </div>
                  </>
               )}
         </div>
         <div className={styles.contentContainer}>
            {!targetPicklist.val
               ? <PicklistSelectionTab />
               : <PicklistEditingTab showSettings={showSettings} />}
         </div>
      </div>
   );
}

function PicklistEditingTab({ showSettings }: { showSettings: boolean }) {
   const [teamQuery, setTeamQuery] = useState("");

   const targetPicklist = useContext(TargetPicklistContext);
   const picklistCommands = useContext(PicklistCommandContext);
   const comparedTeams = useContext(ComparedTeamKeysContext);

   const picklist: Picklist = targetPicklist.val
      ? (targetPicklist.val.picklist as Picklist)
      : [];

   const setPicklist = (newPicklist: Picklist) =>
      targetPicklist.setVal && targetPicklist.val &&
      targetPicklist.setVal({ ...targetPicklist.val, picklist: newPicklist });

   function handleBack() {
      if (targetPicklist.setVal && comparedTeams.setVal) {
         comparedTeams.setVal([]);
         targetPicklist.setVal(undefined);
         setCurrentPicklist(undefined);
      }
   }

   function handleSave(notify: boolean) {
      if (targetPicklist.val) {
         if (notify) throwNotification("info", "Saving changes...");
         updatePicklist(targetPicklist.val).then((res) => {
            if (res) {
               if (notify) throwNotification("success", "Saved changes");
            } else {
               if (notify) throwNotification("error", "Error saving changes");
            }
         });
      }
   }

   function handleDelete() {
      if (targetPicklist.val && targetPicklist.setVal && picklistCommands) {
         picklistCommands.deletePicklist();
         targetPicklist.setVal(undefined);
      }
   }

   function handleChangeVisibility(vis: "default" | "public" | "private") {
      picklistCommands.changePicklistVisibility(vis);
   }

   const [seperateExcluded, setSeperateExcluded] = useState(true);

   const sortedPicklist = seperateExcluded
      ? picklist.slice().sort((a, b) => Number(a.excluded) - Number(b.excluded))
      : picklist;

   const teamDataCtx = useContext(GlobalTeamDataContext);

   const filteredPicklist = teamQuery == ""
      ? sortedPicklist
      : sortedPicklist.filter((val) =>
         teamDataCtx.TBAdata.filter((e) => e.key == val.teamKey).some((e) =>
            e.name.toLowerCase().includes(teamQuery.toLowerCase()) ||
            e.key.includes(teamQuery.toLowerCase())
         )
      );

   const [saveOnEdit, setSaveOnEdit] = useState(true);

   useEffect(() => {
      handleSave(false);
      // just let me do it i know what im doing :(
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [targetPicklist.val]);

   const [showDropdown, setShowDropdown] = useState(false);

   return (
      <div className={styles.editTabContainer}>
         <AnimatePresence>
            {showSettings &&
               (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{
                        height: "7.75rem",
                        opacity: 1,
                        marginBottom: "1.15rem",
                     }}
                     exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                     transition={{
                        duration: 0.2,
                     }}
                     className={styles.picklistOptionBox}
                  >
                     <div
                        className={styles.singleOption}
                     >
                        Picklist visibility{" "}
                        <div
                           className={styles.visibilityCard}
                           onClick={() => setShowDropdown(!showDropdown)}
                        >
                           {targetPicklist.val?.type}
                           <div>
                              <i className="fa-solid fa-caret-down" />
                           </div>
                           <AnimatePresence>
                              {showDropdown && (
                                 <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={styles.optionsDropdown}
                                 >
                                    <Tippy
                                       placement="right"
                                       content="Only admins and you can view/edit this picklist"
                                    >
                                       <div
                                          className={styles.optionText}
                                          onClick={() =>
                                             handleChangeVisibility("default")}
                                       >
                                          default
                                       </div>
                                    </Tippy>
                                    <Tippy
                                       placement="right"
                                       content="Default permissions, but anyone can view"
                                    >
                                       <div
                                          className={styles.optionText}
                                          onClick={() =>
                                             handleChangeVisibility("private")}
                                       >
                                          private
                                       </div>
                                    </Tippy>{" "}
                                    <Tippy
                                       placement="right"
                                       content="Only you can view/edit this picklist"
                                    >
                                       <div
                                          className={styles.optionText}
                                          onClick={() =>
                                             handleChangeVisibility("public")}
                                       >
                                          public
                                       </div>
                                    </Tippy>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                     <div className={styles.singleOption}>
                        Move excluded teams
                        <Checkbox
                           enabled={seperateExcluded}
                           setEnabled={setSeperateExcluded}
                        />
                     </div>
                     <div className={styles.singleOption}>
                        Save on edit
                        <Checkbox
                           enabled={saveOnEdit}
                           setEnabled={setSaveOnEdit}
                        />
                     </div>
                  </motion.div>
               )}
         </AnimatePresence>
         <RoundInput
            value={teamQuery}
            setValue={setTeamQuery}
            placeholder="Search teams..."
            icon={<i className="fa-solid fa-magnifying-glass" />}
            type="text"
            style={{
               height: "3.25rem",
               backgroundColor: "var(--inset)",
               border: "2px solid var(--text-background)",
            }}
         />
         <Reorder.Group
            axis="y"
            values={picklist}
            onReorder={setPicklist}
            layoutScroll
            style={{ overflowY: "scroll" }}
            className={styles.teamsContainer}
            as="div"
         >
            {filteredPicklist.map((val, index) => (
               <PicklistTeamCard key={val.teamKey} team={val} idx={index} />
            ))}
         </Reorder.Group>
         <div className={styles.actionButtons}>
            <div className={styles.squareButton} onClick={handleBack}>
               <i className="fa-solid fa-arrow-left" />
            </div>
            <div className={styles.saveButton} onClick={() => handleSave(true)}>
               Save picklist
               <i
                  className="fa-solid fa-floppy-disk"
                  style={{ fontSize: "1.15rem", color: "var(--primary)" }}
               />
            </div>
            <div className={styles.squareButton} onClick={handleDelete}>
               <i
                  className="fa-solid fa-trash-can"
                  style={{ color: "var(--error)" }}
               />
            </div>
         </div>
      </div>
   );
}

function PicklistTeamCard(
   { team, idx }: {
      team: { teamKey: string; comment?: string; excluded: boolean };
      idx: number;
   },
) {
   const picklistCommands = useContext(PicklistCommandContext);
   const teamDataCtx = useContext(GlobalTeamDataContext);

   /* Team stat cards calculations go here;
    * For each stat, we need the actual value + a percentage (it could be
    * percentile or % of max, whichever is more useful)
    */

   //Team EPA stat card
   const teamEPAData = teamDataCtx.EPAdata[team.teamKey];
   const teamEPA = teamEPAData ? teamEPAData.epa.total_points.mean : 0;
   const teamEPAPercentage = teamEPAData
      ? teamEPA /
         Math.max(
            ...Object.values(teamDataCtx.EPAdata).map(
               (data) => data.epa.total_points.mean,
            ),
         )
      : 0;

   //Team rank stat card
   const teamTBAData = teamDataCtx.TBAdata.find((val) =>
      val.key == team.teamKey
   );
   const teamRank = teamTBAData ? teamTBAData.rank : 0;
   const teamRankPercentage = teamTBAData
      ? 1 -
         ((teamRank + 1) / (teamDataCtx.TBAdata.length))
      : 0;

   const controls = useDragControls();

   const [showAllSettings, setShowAllSettings] = useState(false);

   function handleMoveUp() {
      picklistCommands.moveTeamUp(team.teamKey);
   }

   function handleMoveDown() {
      picklistCommands.moveTeamDown(team.teamKey);
   }

   function handleExclude() {
      picklistCommands.excludeTeam(team.teamKey);
   }

   /*function handlePin() {
      picklistCommands.pinTeam(team.teamKey);
   }*/

   const comparedTeams = useContext(ComparedTeamKeysContext);

   function handleCompare() {
      if (comparedTeams.setVal && comparedTeams.val) {
         const teamIndex = comparedTeams.val.findIndex((val) =>
            val.teamKey == team.teamKey
         );
         if (teamIndex == -1) {
            comparedTeams.setVal((
               prev,
               // 
            ) => [{ teamKey: team.teamKey, minimized: false, pinned: false }, ...prev]);
         } else {
            comparedTeams.setVal((prev) =>
               prev.filter((val) => val.teamKey != team.teamKey)
            );
         }
      }
   }

   return (
      <Reorder.Item
         key={team.teamKey}
         value={team}
         dragListener={false}
         dragControls={controls}
         as="div"
      >
         <div
            className={`${styles.teamCardContainer} ${
               comparedTeams.val?.find((e) => e.teamKey == team.teamKey) &&
               styles.active
            }`}
            style={{
               opacity: (team.excluded ? 0.25 : 1),
            }}
         >
            <div className={styles.teamHeader}>
               <div style={{ display: "flex" }}>
                  <div className={styles.teamDetailsMono}>{idx + 1}</div>&nbsp;
                  <div
                     style={{ color: "var(--text-secondary)" }}
                  >
                     |
                  </div>&nbsp;
                  <div
                     style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "10rem",
                     }}
                     title={teamEPAData
                        ? teamEPAData.team_name
                        : teamTBAData
                        ? teamTBAData.name
                        : "N/A"}
                  >
                     {teamEPAData
                        ? teamEPAData.team_name
                        : teamTBAData
                        ? teamTBAData.name
                        : "N/A"}
                  </div>
               </div>
               <div className={styles.teamDetailsMono}>
                  {parseTeamKey(team.teamKey)}
               </div>
            </div>
            <div
               className={styles.teamDetails}
               onMouseEnter={() => setShowAllSettings(true)}
               onMouseLeave={() => setShowAllSettings(false)}
            >
               <div
                  className={styles.teamOptions}
               >
                  <i
                     className={`fa-solid fa-grip-vertical ${styles.teamDragIcon}`}
                     onPointerDown={(e) => controls.start(e)}
                  />
                  <Tippy content="Compare" placement="bottom">
                     <i
                        className={`fa-solid fa-scale-unbalanced-flip ${styles.teamSettingIcon}`}
                        onClick={handleCompare}
                     />
                  </Tippy>
                  <AnimatePresence>
                     {showAllSettings &&
                        (
                           <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -20, opacity: 0 }}
                              transition={{
                                 duration: 0.1,
                              }}
                              className={styles.teamOptions}
                           >
                              <Tippy content="Move up" placement="bottom">
                                 <i
                                    className={`fa-solid fa-arrow-up ${styles.teamSettingIcon}`}
                                    onClick={handleMoveUp}
                                 />
                              </Tippy>
                              <Tippy content="Move down" placement="bottom">
                                 <i
                                    className={`fa-solid fa-arrow-down ${styles.teamSettingIcon}`}
                                    onClick={handleMoveDown}
                                 />
                              </Tippy>
                              <Tippy content="Exclude" placement="bottom">
                                 <i
                                    className={`fa-solid fa-ban ${styles.teamBanIcon} ${styles.teamSettingIcon}`}
                                    onClick={handleExclude}
                                 />
                              </Tippy>
                           </motion.div>
                        )}
                  </AnimatePresence>
               </div>
               <div className={styles.teamCards}>
                  <PicklistStatCard
                     value={"#" + Math.round(teamRank)}
                     percentage={teamRankPercentage}
                     width={2.75}
                     comment={"Rank"}
                     display
                  />
                  <PicklistStatCard
                     value={teamEPA.toFixed(1)}
                     percentage={teamEPAPercentage}
                     width={2.75}
                     comment={"EPA"}
                     display
                  />
               </div>
            </div>
         </div>
      </Reorder.Item>
   );
}

function PicklistStatCard(
   { value, percentage, comment, width, display }: {
      value: string | number;
      percentage: number;
      comment: string;
      width?: number;
      display: boolean;
   },
) {
   if (!display) return;

   return (
      <Tippy
         content={`${comment} | ${(percentage * 100).toFixed()}% of best`}
         placement="bottom"
      >
         <div
            className={styles.statCard}
            style={{
               width: width ? width + "rem" : "unset",
               opacity: 0.9 * percentage + 0.1,
            }}
         >
            {value}
         </div>
      </Tippy>
   );
}

function PicklistSelectionTab() {
   const [picklistQuery, setPicklistQuery] = useState("");
   const picklistData = useContext(PicklistDataContext);
   const teamData = useContext(GlobalTeamDataContext).TBAdata;

   function handleNewPicklist() {
      throwNotification("info", "Creating new picklist...");
      fetchTeamsByEvent(getEvent() || "").then((res) => {
         if (!res) {
            throwNotification("error", "Error creating picklist");
         }

         const newPicklist: Tables<"event_picklist"> = {
            event: getEvent() || "",
            id: btoa(getLocalUserData().uid + Date.now()),
            picklist: res!.sort((a, b) =>
               (teamData.find((val) => val.key == a.team)?.rank ||
                  0) - (teamData.find((val) => val.key == b.team)?.rank || 0)
            ).map((val) => ({
               teamKey: val.team,
               excluded: false,
            })),
            timestamp: new Date(Date.now()).toUTCString(),
            title: "New Picklist",
            uname: getLocalUserData().name,
            uid: getLocalUserData().uid,
            type: "default",
         };

         if (picklistData.setVal) {
            picklistData.setVal((prev) => ({
               ...prev,
               picklists: [...picklistData.val!.picklists, newPicklist],
            }));
         }

         throwNotification("success", "Created new picklist");
      });
   }

   const queriedPicklists = picklistQuery == ""
      ? picklistData.val?.picklists ? picklistData.val?.picklists : []
      : picklistData.val?.picklists
      ? picklistData.val?.picklists.filter(
         (val) =>
            val.title.toLowerCase().includes(picklistQuery) ||
            val.uname.toLowerCase().includes(picklistQuery),
      )
      : [];

   return (
      <div className={styles.selectionContent}>
         <RoundInput
            value={picklistQuery}
            style={{
               height: "3.25rem",
               backgroundColor: "var(--inset)",
               border: "2px solid var(--text-background)",
            }}
            setValue={setPicklistQuery}
            placeholder="Search picklists..."
            type="text"
            cornerStyle="sharp"
            icon={<i className="fa-solid fa-magnifying-glass" />}
         />
         <div className={styles.picklistList}>
            {picklistData.val?.queryProgress.isLoading && (
               <div className={styles.loadBox}>Loading picklists...</div>
            )}
            {picklistData.val?.queryProgress.isError && (
               <div className={styles.loadBox}>
                  <i className="fa-regular fa-circle-xmark" />
                  &nbsp;Could not load picklists
               </div>
            )}
            {queriedPicklists.length == 0 &&
               !picklistData.val?.queryProgress.isLoading && (
               <div className={styles.loadBox}>
                  <i className="fa-regular fa-circle-xmark" />
                  &nbsp;No picklists found
               </div>
            )}
            {queriedPicklists.map((val, index) => {
               return <PicklistCard picklist={val} key={index} />;
            }) || ""}
         </div>
         <div className={styles.newPicklistButton} onClick={handleNewPicklist}>
            Create a new picklist
            <div
               style={{
                  color: "var(--primary)",
               }}
            >
               <i className="fa-solid fa-plus" />
            </div>
         </div>
      </div>
   );
}

function PicklistCard({ picklist }: { picklist: Tables<"event_picklist"> }) {
   const [hovered, setHovered] = useState(false);
   const targetPicklist = useContext(TargetPicklistContext);

   function handleClick() {
      if (targetPicklist.setVal) targetPicklist.setVal(picklist);
   }

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.2 }}
         className={styles.picklistCard}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         onClick={handleClick}
      >
         <div className={styles.picklistCardTop}>{picklist.title}</div>
         <div className={styles.picklistCardBottom}>
            {!hovered
               ? "Created " +
                  new Date(picklist.timestamp).toLocaleString("en-US", {
                     hour: "numeric",
                     minute: "numeric",
                     month: "numeric",
                     day: "numeric",
                     hour12: false,
                  })
               : `By ${
                  picklist.uid == getLocalUserData().uid
                     ? "you"
                     : picklist.uname
               }`}
            <Tippy
               content={picklist.type == "public"
                  ? "Visibility: Anyone can see this picklist"
                  : picklist.type == "private"
                  ? "Visibility: Only you can see and edit this picklist"
                  : "Visibility: Only you and admins can see and edit this picklist"}
               placement="right"
            >
               <div className={styles.picklistCardType}>
                  {picklist.type.charAt(0).toUpperCase() +
                     picklist.type.substring(1)}
               </div>
            </Tippy>
         </div>
      </motion.div>
   );
}

export default PicklistTab;
