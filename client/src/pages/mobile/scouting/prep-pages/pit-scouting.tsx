import { motion } from "motion/react";
import MobileCardHeader from "../../components/cards/card-universal-components/card-header";
import styles from "./styles.module.css";
import GenericCombobox from "../../../../components/app/input/combobox";
import { useContext, useEffect, useState } from "react";
import {
   getAllData,
   getTeamDetailsStoreName,
} from "../../../../lib/mobile-cache-handler/init";
import { parseTeamKey } from "../../../../utils/logic/app";
import { Tables } from "../../../../lib/supabase/database.types";
import { useLocation } from "wouter";
import { GlobalTeamDataContext } from "../../../../app-global-ctx";
import { getLocalUserData } from "../../../../lib/supabase/auth";

export default function MobileStartPitScouting() {
   const [teamQuery, setTeamQuery] = useState("");
   const [selectedTeam, setSelectedTeam] = useState<
      Tables<"event_team_data"> | null
   >(null);
   const [teamData, setTeamData] = useState<Tables<"event_team_data">[]>([]);

   const [, navigate] = useLocation();

   useEffect(() => {
      getAllData<Tables<"event_team_data">>(getTeamDetailsStoreName()).then(
         (res) => {
            setTeamData(res);
         },
      );
   }, []);

   const filteredTeams = teamQuery == ""
      ? teamData
      : teamData.filter((val) =>
         val.team.toLowerCase().includes(teamQuery.toLowerCase())
      );

   function handleStartScouting() {
      if (
         selectedTeam
      ) {
         navigate(
            `/inpit/${/*UgetEventYear()*/ 2025}/${selectedTeam.team}`,
         );
      }
   }

   function handleSelectAlternate(val: Tables<"event_team_data">) {
      setSelectedTeam(val);
   }

   const globalContext = useContext(GlobalTeamDataContext);

   return (
      <div className={styles.container}>
         <div
            className={styles.returnHeader}
         >
            <div
               className={styles.returnHeaderButton}
               onClick={() => navigate("~/m/scout")}
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
            <MobileCardHeader titleText="Pit Scouting" />
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2, delay: 0.1 }}
               className={styles.selectionBox}
            >
               <div className={styles.nextContainer}>
                  <GenericCombobox<Tables<"event_team_data">>
                     selectedItem={selectedTeam}
                     onChange={setSelectedTeam}
                     items={filteredTeams}
                     setQuery={setTeamQuery}
                     displayValue={(val) => parseTeamKey(val?.team || "")}
                     label="Select team"
                     active
                  />
                  <div
                     className={styles.continueButton}
                     style={{
                        opacity: `${!selectedTeam ? "0.5" : "1"}`,
                     }}
                     onClick={handleStartScouting}
                  >
                     <i className="fa-solid fa-arrow-right" />
                  </div>
               </div>
            </motion.div>
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2, delay: 0.2 }}
               className={styles.alternateMatches}
            >
               Assigned Teams
               {teamData.filter((val) => val.assigned == getLocalUserData().uid)
                     .length > 0
                  ? teamData.filter((val) =>
                     val.assigned == getLocalUserData().uid
                  )
                     .map((val) => {
                        return (
                           <div
                              className={styles.alternateMatchContainer}
                              onClick={() => handleSelectAlternate(val)}
                           >
                              <div className={styles.matchHeader}>
                                 {parseTeamKey(val.team)}
                              </div>
                              <div className={styles.teamHeader}>
                                 {globalContext.TBAdata.find((a) =>
                                    "frc" + a.team == val.team
                                 )?.name}{" "}
                                 <i
                                    style={{ color: "var(--text-secondary)" }}
                                    className="fa-solid fa-chevron-right"
                                 />
                              </div>
                           </div>
                        );
                     })
                  : <div className={styles.errBox}>No teams found</div>}
            </motion.div>
         </motion.div>
         <div className={styles.notice}>
         </div>
      </div>
   );
}
