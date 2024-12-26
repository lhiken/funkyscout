import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import styles from "./picklist-tab.module.css";
import {
   PicklistDataContext,
   TargetPicklistContext,
} from "../picklists-context";
import RoundInput from "../../../../components/app/input/round-input";
import { Tables } from "../../../../lib/supabase/database.types";
import Tippy from "@tippyjs/react";
import { getLocalUserData } from "../../../../lib/supabase/auth";
import { getEvent, parseTeamKey } from "../../../../utils/logic/app";
import { fetchTeamsByEvent } from "../../../../lib/supabase/data";
import throwNotification from "../../../../components/app/toast/toast";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { Picklist } from "../../../../schemas/schema";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";
import { Reorder } from "motion/react";

function PicklistTab() {
   const targetPicklist = useContext(TargetPicklistContext);

   const inputRef = useRef(null);
   const [inputWidth, setInputWidth] = useState(0);

   //just pretend this isnt even here, i dont even know what it does
   useEffect(() => {
      if (inputRef.current) {
         const span = document.createElement("span");
         span.style.font = getComputedStyle(inputRef.current).font;
         span.textContent = (targetPicklist.val?.title || "") + " "; // Add a space to ensure spaces are measured

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

         targetPicklist.setVal({
            ...targetPicklist.val,
            title: newTitle,
         });
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.containerHeader}>
            <div>
               {!targetPicklist.val
                  ? (
                     <>
                        <i className="fa-solid fa-list-ul" />
                        &nbsp; Picklists
                     </>
                  )
                  : (
                     <>
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
                     </>
                  )}
            </div>
         </div>
         <div className={styles.contentContainer}>
            {!targetPicklist.val
               ? <PicklistSelectionTab />
               : <PicklistEditingTab />}
         </div>
      </div>
   );
}

function PicklistEditingTab() {
   const [teamQuery, setTeamQuery] = useState("");

   const targetPicklist = useContext(TargetPicklistContext);

   const picklist: Picklist = targetPicklist.val
      ? (targetPicklist.val.picklist as Picklist)
      : [];

   const setPicklist = (newPicklist: Picklist) =>
      targetPicklist.setVal && targetPicklist.val &&
      targetPicklist.setVal({ ...targetPicklist.val, picklist: newPicklist });

   return (
      <div className={styles.editTabContainer}>
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
            {picklist.map((val) => (
               <PicklistTeamCard key={val.teamKey} team={val} />
            ))}
         </Reorder.Group>
         <div className={styles.actionButtons}>
            <div className={styles.squareButton}>
               <i className="fa-solid fa-arrow-left" />
            </div>
            <div className={styles.saveButton}>
               Save picklist
               <i
                  className="fa-solid fa-floppy-disk"
                  style={{ fontSize: "1.15rem", color: "var(--primary)" }}
               />
            </div>
            <div className={styles.squareButton}>
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
   { team }: { team: { teamKey: string; comment?: string; excluded: boolean } },
) {
   /* Team stat cards calculations go here;
    * For each stat, we need the actual value + a percentage (it could be
    * percentile or % of max, whichever is more useful)
    */

   //Team EPA stat card
   const teamEPAData = useContext(GlobalTeamDataContext).EPAdata[team.teamKey];
   const teamEPA = teamEPAData.epa.total_points.mean;
   const teamEPAPercentage = teamEPA /
      Math.max(
         ...Object.values(useContext(GlobalTeamDataContext).EPAdata).map(
            (data) => data.epa.total_points.mean,
         ),
      );

   //Team rank stat card
   const teamTBAData = useContext(GlobalTeamDataContext).TBAdata.find((val) =>
      val.key == team.teamKey
   );
   const teamRank = teamTBAData ? teamTBAData.rank : 0;
   const teamRankPercentage = 1 -
      ((teamRank - 1) / (useContext(GlobalTeamDataContext).TBAdata.length));
   const targetPicklist = useContext(TargetPicklistContext);

   const picklist: Picklist = targetPicklist.val
      ? targetPicklist.val.picklist as Picklist
      : [];

   const rank = picklist.findIndex((val) => val.teamKey == team.teamKey) + 1;

   const controls = useDragControls();

   const [showAllSettings, setShowAllSettings] = useState(false);

   return (
      <Reorder.Item
         key={team.teamKey}
         value={team}
         dragListener={false}
         dragControls={controls}
         as="div"
      >
         <div
            className={styles.teamCardContainer}
            style={{
               opacity: (team.excluded ? 0.25 : 1),
            }}
         >
            <div className={styles.teamHeader}>
               <div style={{ display: "flex" }}>
                  <div className={styles.teamDetailsMono}>{rank}</div>&nbsp;
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
                     title={teamEPAData?.name}
                  >
                     {teamEPAData?.name}
                  </div>
               </div>
               <div className={styles.teamDetailsMono}>
                  {parseTeamKey(team.teamKey)}
               </div>
            </div>
            <div className={styles.teamDetails}>
               <div
                  className={styles.teamOptions}
                  onMouseEnter={() => setShowAllSettings(true)}
                  onMouseLeave={() => setShowAllSettings(false)}
               >
                  <i
                     className={`fa-solid fa-grip-vertical ${styles.teamDragIcon}`}
                     onPointerDown={(e) => controls.start(e)}
                  />
                  <Tippy content="Compare" placement="bottom">
                     <i
                        className={`fa-solid fa-scale-unbalanced-flip ${styles.teamSettingIcon}`}
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
                                 />
                              </Tippy>
                              <Tippy content="Move down" placement="bottom">
                                 <i
                                    className={`fa-solid fa-arrow-down ${styles.teamSettingIcon}`}
                                 />
                              </Tippy>
                              <Tippy content="Exclude" placement="bottom">
                                 <i
                                    className={`fa-solid fa-ban ${styles.teamBanIcon} ${styles.teamSettingIcon}`}
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
