import { useContext, useState } from "react";
import styles from "./picklist-tab.module.css";
import { PicklistDataContext, TargetPicklistContext } from "../picklists-context";
import RoundInput from "../../../../components/app/input/round-input";
import { Tables } from "../../../../lib/supabase/database.types";
import Tippy from "@tippyjs/react";
import { getLocalUserData } from "../../../../lib/supabase/auth";
import { getEvent } from "../../../../utils/logic/app";
import { Picklist } from "../../../../schemas/schema";

function PicklistTab() {
   const targetPicklist = useContext(TargetPicklistContext);

   return (
      <div className={styles.container}>
         <div className={styles.containerHeader}>
            <div>
               {!targetPicklist.val ?
                  <><i className="fa-solid fa-list-ul" /> Picklists</> : <>
                  <i className="fa-solid fa-chevron-left" />
                  </>}/
            </div>
         </div>
         <div className={styles.contentContainer}>
            {!targetPicklist.val ?
               <PicklistSelectionTab />
               : <PicklistEditingTab />}
         </div>
      </div>
   );
}

function PicklistEditingTab() {
   return (
      <div>

      </div>
   )
}

function PicklistSelectionTab() {
   const [picklistQuery, setPicklistQuery] = useState("");
   const picklistData = useContext(PicklistDataContext);

   function handleNewPicklist() {

      const newPicklist: Tables<"event_picklist"> = {
         event: getEvent() || "",
         picklist: {},
         timestamp: (new Date(Date.now())).toUTCString(),
         title: "New Picklist",
         uname: getLocalUserData().name,
         uid: getLocalUserData().uid,
         type: "default",
      }

      picklistData.setVal && picklistData.setVal((prev) => ({
         ...prev,
         picklists: [...picklistData.val?.picklists!, newPicklist],
      }))
   }

   const queriedPicklists = picklistQuery == "" ?
      picklistData.val?.picklists ? picklistData.val?.picklists : [] :
      picklistData.val?.picklists ? picklistData.val?.picklists.filter((val) => val.title.toLowerCase().includes(picklistQuery) || val.uname.toLowerCase().includes(picklistQuery)) : [];

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
            {picklistData.val?.queryProgress.isLoading && <div className={styles.loadBox}>Loading picklists...</div>}
            {picklistData.val?.queryProgress.isError && <div className={styles.loadBox}><i className="fa-regular fa-circle-xmark" />&nbsp;Could not load picklists</div>}
            {queriedPicklists.length == 0 && <div className={styles.loadBox}><i className="fa-regular fa-circle-xmark" />&nbsp;No picklists found</div>}
            {
               queriedPicklists.map((val, index) => {
                  return <PicklistCard picklist={val} key={index} />
               }) || ""
            }
         </div>
         <div className={styles.newPicklistButton} onClick={handleNewPicklist}>
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
   const targetPicklist = useContext(TargetPicklistContext);

   function handleClick() {
      targetPicklist.setVal && targetPicklist.setVal(picklist.picklist as Picklist);
   }

   return (
      <div className={styles.picklistCard} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={handleClick}>
         <div className={styles.picklistCardTop}>{picklist.title}</div>
         <div className={styles.picklistCardBottom}>
            {!hovered ? "Created " + (new Date(picklist.timestamp)).toLocaleString('en-US', {
               hour: 'numeric',
               minute: 'numeric',
               month: 'numeric',
               day: 'numeric',
               hour12: false
            }) : `By ${picklist.uid == getLocalUserData().uid ? "you" : picklist.uname}`}
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
