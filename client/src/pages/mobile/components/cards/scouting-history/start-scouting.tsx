import { useState } from "react";
import MobileCardHeader from "../card-universal-components/card-header";
import styles from "./start-scouting.module.css";

export default function MobileScoutingHistoryCard() {
   const [userData] = useState<string[]>([]); //type will be different

   return (
      <div className={styles.container}>
         <MobileCardHeader
            titleText="Scouting History"
            tooltipText="Click on a match to see the data for that match"
         />
         <div className={styles.cardContainer}>
            {userData.length <= 0
               ? (
                  <div className={styles.errBox}>
                     You haven't scouted any matches yet
                     <i
                        style={{ fontSize: "2rem" }}
                        className="fa-regular fa-face-frown-open"
                     />
                  </div>
               )
               : <PastShiftCard />}
         </div>
      </div>
   );
}

function PastShiftCard() {
   return (
      <div className={styles.pastShiftCard}>
         this is a shift
      </div>
   );
}
