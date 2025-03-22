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
import { parseMatchKey, parseTeamKey } from "../../../../utils/logic/app";
import {
   getNextAssignedMatch,
   getNextNearAssignedMatches,
} from "../../../../lib/app/helpers";
import { Tables } from "../../../../lib/supabase/database.types";
import { useLocation } from "wouter";

export default function MobileStartMatchScouting() {
   const [matchQuery, setMatchQuery] = useState("");
   const [selectedMatch, setSelectedMatch] = useState<
      EventScheduleEntry | null
   >(null);
   const [matchData, setMatchData] = useState<EventScheduleEntry[]>([]);

   const [teamQuery, setTeamQuery] = useState("");
   const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
   const [teamData, setTeamData] = useState<string[]>([]);

   const [noChange] = useState(true);

   const [, navigate] = useLocation();

   useEffect(() => {
      if (noChange) {
         getNextAssignedMatch().then((res) => {
            const targetMatch = matchData.find((val) =>
               val.matchKey == res?.data.match
            ) || null;
            setSelectedMatch(targetMatch);
            console.log(selectedMatch);
         });
      } else {
         if (!selectedMatch) {
            setTeamData([]);
            setSelectedTeam(null);
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filteredMatches = matchQuery == ""
      ? matchData
      : matchData.filter((val) =>
         parseMatchKey(val.matchKey, "long").toLowerCase().includes(
            matchQuery.toLowerCase(),
         )
      );

   const filteredTeams = teamQuery == ""
      ? teamData
      : teamData.filter((val) =>
         val.toLowerCase().includes(teamQuery.toLowerCase())
      );

   interface AlternateMatch {
      data: Tables<"event_schedule">;
      time: number | null;
      scouted: boolean;
   }

   const [alternateMatches, setAlternateMatches] = useState<AlternateMatch[]>(
      [],
   );

   useEffect(() => {
      getAllData<EventScheduleEntry>(getMatchDetailsStoreName()).then((res) => {
         setMatchData(res);
      });

      getNextNearAssignedMatches().then((res) => {
         setAlternateMatches(res.filter((val) => val != null));
      });
   }, []);

   function handleSelectAlternate(match: AlternateMatch) {
      const targetMatch =
         matchData.find((val) => val.matchKey == match.data.match) || null;
      setSelectedMatch(targetMatch);
      setSelectedTeam(
         `${match.data.alliance == "blue" ? "B" : "R"}${match.data.team}`,
      );
   }

   function handleStartScouting() {
      if (
         selectedMatch != null && selectedTeam != null &&
         [...selectedMatch.blueTeams, ...selectedMatch.redTeams].includes(
            selectedTeam.substring(1),
         )
      ) {
         navigate(
            `/inmatch/${/*UgetEventYear()*/ 2025}/m=${selectedMatch.matchKey}&t=${selectedTeam}&a=${
               selectedMatch.redTeams.includes(selectedTeam.substring(1))
                  ? "r"
                  : "b"
            }`,
         );
      }
   }

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
            <MobileCardHeader titleText="Match Scouting!" />
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2, delay: 0.1 }}
               className={styles.selectionBox}
            >
               <GenericCombobox<EventScheduleEntry>
                  selectedItem={selectedMatch}
                  onChange={(e) => {
                     setSelectedMatch(e);
                     if (e) {
                        setTeamData([
                           ...e.blueTeams.map((val) => `B${val}`),
                           ...e.redTeams.map((val) => `R${val}`),
                        ]);
                     }
                  }}
                  items={filteredMatches}
                  setQuery={setMatchQuery}
                  displayValue={(val) =>
                     parseMatchKey(val?.matchKey || "", "nexus")}
                  label="Select match"
                  active
               />
               <div className={styles.nextContainer}>
                  <GenericCombobox<string>
                     selectedItem={selectedTeam}
                     onChange={setSelectedTeam}
                     items={filteredTeams}
                     setQuery={setTeamQuery}
                     displayValue={(val) =>
                        `${
                           val
                              ? val?.substring(0, 1) == "B"
                                 ? "Blue - "
                                 : "Red - "
                              : ""
                        }` + parseTeamKey((val || "").substring(1))}
                     label="Select team"
                     active={selectedMatch != null}
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
               Recommended Matches
               {alternateMatches.length > 0
                  ? alternateMatches.map((val) => {
                     return (
                        <div
                           className={styles.alternateMatchContainer}
                           onClick={() => handleSelectAlternate(val)}
                        >
                           <div className={styles.matchHeader}>
                              {parseMatchKey(val.data.match, "nexus")}
                           </div>
                           <div className={styles.teamHeader}>
                              {parseTeamKey(val.data.team)} -{" "}
                              {val.data.alliance == "red" ? "Red" : "Blue"}
                              <i
                                 style={{ color: "var(--text-secondary)" }}
                                 className="fa-solid fa-chevron-right"
                              />
                           </div>
                        </div>
                     );
                  })
                  : <div className={styles.errBox}>No matches found</div>}
            </motion.div>
         </motion.div>
         <div className={styles.notice}>
            The match does NOT start after clicking the the arrow button. Please
            lock orientation or turn off autorotate before scouting.
         </div>
      </div>
   );
}
