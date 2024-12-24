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
import { getEvent } from "../../../../utils/logic/app";
import { fetchTeamsByEvent } from "../../../../lib/supabase/data";
import throwNotification from "../../../../components/app/toast/toast";
import { motion } from "motion/react";

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
                                 bottom: "0",
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
   return <div></div>;
}

function PicklistSelectionTab() {
   const [picklistQuery, setPicklistQuery] = useState("");
   const picklistData = useContext(PicklistDataContext);

   function handleNewPicklist() {
      throwNotification("info", "Creating new picklist...");
      fetchTeamsByEvent(getEvent() || "").then((res) => {
         if (!res) {
            throwNotification("error", "Error creating picklist");
         }

         const newPicklist: Tables<"event_picklist"> = {
            event: getEvent() || "",
            id: btoa(getLocalUserData().uid + Date.now()),
            picklist: res!.map((val) => ({
               teamKey: val,
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
            {queriedPicklists.length == 0 && (
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
