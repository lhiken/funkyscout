import { useEffect, useState } from "react";
import MobileCardHeader from "../card-universal-components/card-header";
import styles from "./picklist-card.module.css";
import { fetchPicklists } from "../../../../../lib/supabase/data";
import { getEvent, timeFromNow } from "../../../../../utils/logic/app";
import { Tables } from "../../../../../lib/supabase/database.types";

export default function MobilePicklistCard() {
   const [picklists, setPicklists] = useState<Tables<"event_picklist">[]>();

   useEffect(() => {
      fetchPicklists(getEvent() || "").then((res) => {
         setPicklists(res);
      });
   }, []);

   return (
      <div className={styles.container}>
         <MobileCardHeader
            titleText="Picklists"
            tooltipText="View picklists you've created"
         />
         <div className={styles.picklistContainer}>
            {picklists
               ? (
                  <>
                     <div className={styles.addNew}>
                        +
                     </div>
                     {picklists?.map((val) => {
                        return (
                           <div className={styles.picklistCard} key={val.id}>
                              <div className={styles.cardHeader}>
                                 {val.title}
                                 <div
                                    style={{ color: "var(--text-secondary)" }}
                                 >
                                    {val.uname}
                                 </div>
                              </div>
                              <div className={styles.cardBottom}>
                                 <div style={{ color: "var(--primary)" }}>
                                    {val.type[0].toUpperCase() +
                                       val.type.substring(1)}
                                 </div>
                                 <div>
                                    {timeFromNow(new Date(val.timestamp)).value}
                                    {" "}
                                    ago
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </>
               )
               : (
                  <div className={styles.loadBox}>
                     Loading picklists...
                  </div>
               )}
         </div>
      </div>
   );
}
