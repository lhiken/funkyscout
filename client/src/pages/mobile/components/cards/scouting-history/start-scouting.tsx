import { useEffect, useState } from "react";
import MobileCardHeader from "../card-universal-components/card-header";
import styles from "./start-scouting.module.css";
import {
   getAllData,
   getScoutedMatchesStoreName,
   getServerMatchesStoreName,
} from "../../../../../lib/mobile-cache-handler/init";
import { Tables } from "../../../../../lib/supabase/database.types";
import { getLocalUserData } from "../../../../../lib/supabase/auth";
import {
   parseMatchKey,
   parseTeamKey,
   timeFromNow,
} from "../../../../../utils/logic/app";

export default function MobileScoutingHistoryCard() {
   const [history, setHistory] = useState<Tables<"event_match_data">[]>([]); //type will be different

   useEffect(() => {
      getAllData<Tables<"event_match_data">>(getServerMatchesStoreName()).then(
         (res1) => {
            getAllData<Tables<"event_match_data">>(getScoutedMatchesStoreName())
               .then((res2) => {
                  const uid = getLocalUserData().uid;
                  const history = [...res1, ...res2].filter((val) =>
                     val.uid == uid
                  ).sort((a, b) =>
                     new Date(b.timestamp).getTime() -
                     new Date(a.timestamp).getTime()
                  );
                  setHistory(history);
               });
         },
      );
   });

   return (
      <div className={styles.container}>
         <MobileCardHeader
            titleText="Scouting History"
            tooltipText="Click on a match to see the data for that match"
         />
         <div className={styles.cardContainer}>
            {history.length <= 0
               ? (
                  <div className={styles.errBox}>
                     You haven't scouted any matches yet
                     <i
                        style={{ fontSize: "2rem" }}
                        className="fa-regular fa-face-frown-open"
                     />
                  </div>
               )
               : history.map((val, index) => {
                  return <PastShiftCard shift={val} key={index} />;
               })}
         </div>
      </div>
   );
}

function PastShiftCard({ shift }: {
   shift: Tables<"event_match_data">;
}) {
   return (
      <div className={styles.pastShiftCard}>
         <div className={styles.shiftCardHeader}>
            {parseMatchKey(shift.match, "nexus")}
         </div>
         <div className={styles.shiftCardDetails}>
            Team {parseTeamKey(shift.team)}
            <div>
               {timeFromNow(new Date(shift.timestamp)).value} ago
            </div>
         </div>
      </div>
   );
}
