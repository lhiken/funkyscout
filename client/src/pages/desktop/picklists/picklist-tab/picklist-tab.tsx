import { useContext, useState } from "react";
import styles from "./picklist-tab.module.css";
import { PicklistDataContext } from "../picklists-context";
import RoundInput from "../../../../components/app/input/round-input";
import { Tables } from "../../../../lib/supabase/database.types";
import Tippy from "@tippyjs/react";
import TextTransition from "react-text-transition";
import { getLocalUserData } from "../../../../lib/supabase/auth";

function PicklistTab() {
   return (
      <div className={styles.container}>
         <div className={styles.containerHeader}>
            <div>
               <i className="fa-solid fa-list-ul" />&nbsp; Picklists
            </div>
         </div>
         <div className={styles.contentContainer}>
            <PicklistSelectionTab />
         </div>
      </div>
   );
}

function PicklistSelectionTab() {
   const [picklistQuery, setPicklistQuery] = useState("");
   const picklistData = useContext(PicklistDataContext);

   return (
      <div className={styles.selectionContent}>
         <RoundInput value={picklistQuery} style={{
            height: "3.25rem",
            backgroundColor: "var(--inset)",
            border: "2px solid var(--text-background)",
         }} setValue={setPicklistQuery} placeholder="Search picklists..." type="text" cornerStyle="sharp" icon={
            <i className="fa-solid fa-magnifying-glass" />
         } />
         <div className={styles.picklistList}>
            <PicklistCard picklist={{
               event: "2024casf",
               picklist: {},
               title: "Fake Picklist",
               uid: "2323",
               uname: "Nobody",
               timestamp: "2024-12-22T15:30:00+02:00",
               type: "default"
            }} />
            {
               picklistData.val?.picklists.map((val, index) => {
                  return <PicklistCard picklist={val} key={index} />
               }) || ""
            }
         </div>
         <div className={styles.newPicklistButton}>
            Create a new picklist<div style={{
               color: "var(--primary)"
            }}><i className="fa-solid fa-plus" />
            </div>
         </div>
      </div>
   )
}

function PicklistCard({
   picklist
}: { picklist: Tables<"event_picklist"> }) {
   const [hovered, setHovered] = useState(false);

   return (
      <div className={styles.picklistCard} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
         <div className={styles.picklistCardTop}>{picklist.title}</div>
         <div className={styles.picklistCardBottom}>
            <TextTransition inline={true} direction="down">
               {!hovered ? "Created " + (new Date(picklist.timestamp)).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour12: false // If you want 12-hour time format. Set to false for 24-hour format
               }) : `By ${picklist.uid == getLocalUserData().uid ? "you" : picklist.uname}`}
            </TextTransition>
            <Tippy content={picklist.type == "public" ? "Visibility: Anyone can see this picklist" : picklist.type == "private" ? "Visibility: Only you can see and edit this picklist" : "Visibility: Only you and admins can see and edit this picklist"} placement="right">
               <div className={styles.picklistCardType}>
                  {picklist.type.charAt(0).toUpperCase() + picklist.type.substring(1)}
               </div>
            </Tippy>
         </div>
      </div>
   )
}

export default PicklistTab;
