import { useEffect, useState } from "react";
import MobileCardHeader from "../card-universal-components/card-header";
import styles from "./start-scouting.module.css";
import { getUserScoutingProgress } from "../../../../../lib/app/user-progression";
import { useLocation } from "wouter";

export default function MobileStartScoutingCard() {
   const [scoutingData, setScoutingData] = useState({
      pitScouting: { assigned: 0, done: 0 },
      matchScouting: { assigned: 0, done: 0 },
   });
   const [, setLocation] = useLocation();

   useEffect(() => {
      getUserScoutingProgress().then((res) => {
         setScoutingData(res);
      });
   }, []);

   const pitProgress = scoutingData.pitScouting
      ? scoutingData.pitScouting.assigned > scoutingData.pitScouting.done
         ? ((scoutingData.pitScouting.done /
            scoutingData.pitScouting.assigned) *
            100).toFixed(0) + "% done"
         : "All done!"
      : "N/A";

   const matchProgress = scoutingData.matchScouting
      ? scoutingData.matchScouting.assigned > scoutingData.matchScouting.done
         ? ((scoutingData.matchScouting.done /
            scoutingData.matchScouting.assigned) *
            100).toFixed(0) + "% done"
         : `All done!`
      : "N/A";

   function handlePitScoutClick() {
      setLocation("/scout/pit");
   }

   function handleMatchScoutClick() {
      setLocation("/scout/match");
   }

   return (
      <div className={styles.container}>
         <MobileCardHeader
            titleText="Start Scouting"
            tooltipText="Choose a scouting mode from the options below"
         />
         <div className={styles.buttonContainer}>
            <ScoutingButton
               header="Pit Scouting"
               progress={pitProgress}
               callback={handlePitScoutClick}
               icon="/app/icons/tools.svg"
            />
            <ScoutingButton
               header="Match Scouting"
               progress={matchProgress}
               callback={handleMatchScoutClick}
               icon="/app/icons/medal.svg"
            />
         </div>
      </div>
   );
}

function ScoutingButton({ header, progress, callback, icon }: {
   header: string;
   progress: string;
   icon: string;
   callback: () => void;
}) {
   return (
      <div className={styles.scoutingButton} onClick={callback}>
         <div className={styles.scoutingButtonHeader}>{header}</div>
         <img
            src={icon}
            alt="Medal icon"
            className={styles.buttonIcon}
         />
         <div className={styles.scoutingButtonProgress}>
            {progress}
            <i
               className="fa-solid fa-circle-arrow-right"
               style={{
                  color: "var(--primary)",
                  fontSize: "1.5rem",
               }}
            />
         </div>
      </div>
   );
}
