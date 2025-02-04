import { motion } from "motion/react";
import MobileCardHeader from "../../components/cards/card-universal-components/card-header";
import styles from "./styles.module.css";
import GenericCombobox from "../../../../components/app/input/combobox";
import { useEffect, useState } from "react";
import {
   getAllData,
   getMatchDetailsStoreName,
} from "../../../../lib/mobile-cache-handler/init";
import { EventScheduleEntry } from "../../../../lib/tba/events";
import { parseMatchKey } from "../../../../utils/logic/app";

export default function MobileStartMatchScouting() {
   const [matchQuery, setMatchQuery] = useState("");
   const [selectedMatch, setSelectedMatch] = useState<
      EventScheduleEntry | null
   >(null);
   const [matchData, setMatchData] = useState<EventScheduleEntry[]>([]);

   useEffect(() => {
      getAllData<EventScheduleEntry>(getMatchDetailsStoreName()).then((res) => {
         setMatchData(res);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filteredMatches = matchQuery == ""
      ? matchData
      : matchData.filter((val) =>
         val.matchKey.toLowerCase().includes(matchQuery.toLowerCase())
      );

   return (
      <div className={styles.container}>
         <div
            className={styles.returnHeader}
         >
            <div
               className={styles.returnHeaderButton}
               onClick={() => history.back()}
            >
               <div>
                  <i className="fa-solid fa-chevron-left" />
               </div>
               Return
            </div>
            <div className={styles.seperator} />
         </div>
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.matchSelectionBox}
         >
            <MobileCardHeader titleText="Match Scouting" />
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2, delay: 0.1 }}
               className={styles.selectionBox}
            >
               <GenericCombobox<EventScheduleEntry>
                  selectedItem={selectedMatch}
                  onChange={setSelectedMatch}
                  items={filteredMatches}
                  setQuery={setMatchQuery}
                  displayValue={(val) =>
                     parseMatchKey(val?.matchKey || "", "nexus")}
                  label="Select match"
               />
               <div className={styles.nextContainer}>
                  <GenericCombobox<EventScheduleEntry>
                     selectedItem={selectedMatch}
                     onChange={setSelectedMatch}
                     items={filteredMatches}
                     setQuery={setMatchQuery}
                     displayValue={(val) =>
                        parseMatchKey(val?.matchKey || "", "nexus")}
                     label="Select team"
                  />
                  <div className={styles.continueButton}>
                     <i className="fa-solid fa-arrow-right" />
                  </div>
               </div>
            </motion.div>
         </motion.div>
         <div className={styles.notice}>
            Remember to lock screen orientation or turn off auto-rotate before
            scouting
         </div>
      </div>
   );
}
