import { useContext, useState } from "react";
import styles from "./picklist-tab.module.css";
import { PicklistDataContext } from "../picklists-context";
import RoundInput from "../../../../components/app/input/round-input";
import { Picklist } from "../../../../schemas/schema";
import { Tables } from "../../../../lib/supabase/database.types";

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
               title: "Main Picklist",
               uid: "2323",
               uname: "Chen"
            }}/>
            {
               picklistData.val?.picklists.map((val, index) => {
                  return <PicklistCard picklist={val} key={index} />
               }) || ""
            }
         </div>
         <div className={styles.newPicklistButton}>
            Create a new picklist
         </div>
      </div>
   )
}

function PicklistCard({
   picklist
}: { picklist: Tables<"event_picklist"> }) {
   return (
      <div className={styles.picklistCard}>
         {picklist.title}
      </div>
   )
}

export default PicklistTab;
