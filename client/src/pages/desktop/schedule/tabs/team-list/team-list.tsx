import { useContext, useState } from "react";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";
import styles from "./styles.module.css";
import RoundInput from "../../../../../components/app/input/round-input";
import TeamAssignmentCard from "./team-card";
import Checkbox from "../../../../../components/app/buttons/checkbox";
import { getFocusTeam } from "../../../../../utils/logic/app";
import { AnimatePresence, motion } from "motion/react";

function TeamList() {
   const { val } = useContext(ScheduleContext);
   const { val: assignedData, setVal: setAssignedData } = useContext(
      AssignmentContext,
   );

   const [teamQuery, setTeamQuery] = useState<string>("");

   const queriedTeams = (
      teamQuery
         ? val?.teamData?.filter(
            (team) =>
               team.key.toLowerCase().includes(teamQuery.toLowerCase()) ||
               team.name.toLowerCase().includes(teamQuery.toLowerCase()),
         )
         : val?.teamData
   )?.sort((a, b) => {
      const aCount = assignedData?.matchData?.filter((i) =>
         i.team === a.key && i.uid
      ).length || 0;

      const bCount = assignedData?.matchData?.filter((i) =>
         i.team === b.key && i.uid
      ).length || 0;

      return bCount - aCount;
   });

   const [showOptions, setShowOptions] = useState(false);

   const [prioritizePartners, setPrioritizePartners] = useState(false);
   const [prioritizeOpponents, setPrioritizeOpponents] = useState(false);

   function handleOptionClick({
      partner,
   }: { partner: boolean }) {
      const priorityList: Set<string> = new Set();
      const schedule = val?.matchData || {};
      const focusTeam = "frc" + getFocusTeam() || "";

      let partnerPriority = prioritizePartners;
      let opponentPriority = prioritizeOpponents;

      if (partner && partnerPriority) {
         setPrioritizePartners(false);
         partnerPriority = false;
      } else if (partner) {
         setPrioritizePartners(true);
         partnerPriority = true;
      }

      if (!partner && opponentPriority) {
         setPrioritizeOpponents(false);
         opponentPriority = false;
      } else if (!partner) {
         setPrioritizeOpponents(true);
         opponentPriority = true;
      }

      Object.keys(schedule)
         .filter((match) => match.includes("qm"))
         .filter((match) =>
            [...schedule[match].blueTeams, ...schedule[match].redTeams]
               .includes(focusTeam)
         )
         .forEach((key) => {
            const matchData = schedule[key];
            const isBlueAlliance = partner
               ? matchData.blueTeams.includes(focusTeam)
               : matchData.redTeams.includes(focusTeam);

            const partners = isBlueAlliance
               ? matchData.blueTeams.filter((team) => team !== focusTeam)
               : matchData.redTeams.filter((team) => team !== focusTeam);

            partners.forEach((partner) => priorityList.add(partner));
         });

      if (setAssignedData && assignedData) {
         if (
            ((partner && partnerPriority) || (!partner && opponentPriority))
         ) {
            setAssignedData({
               ...assignedData,
               priorityTeams: [
                  ...new Set([...assignedData.priorityTeams, ...priorityList]),
               ],
            });
         } else {
            setAssignedData({
               ...assignedData,
               priorityTeams: assignedData.priorityTeams.filter(
                  (team) => !priorityList.has(team),
               ),
            });
         }
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-robot" />&nbsp;&nbsp;Event Teams
            </div>
            <div
               className={styles.settingsContainer}
               onClick={() => setShowOptions(!showOptions)}
            >
               <i
                  className={`fa-solid fa-chevron-${
                     showOptions ? "up" : "down"
                  }`}
                  style={{
                     fontSize: "1.1rem",
                  }}
               />
            </div>
         </div>
         <AnimatePresence>
            {showOptions && (
               <motion.div
                  initial={{ height: 0, opacity: 0 }} // Skip initial animation on first render
                  animate={{ height: "4rem", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={styles.optionContainer}
               >
                  <div
                     className={styles.option}
                     onClick={() => {
                        handleOptionClick({ partner: true });
                     }}
                  >
                     Prioritize partners{" "}
                     <Checkbox enabled={prioritizePartners} />
                  </div>
                  <div
                     className={styles.option}
                     onClick={() => {
                        handleOptionClick({ partner: false });
                     }}
                  >
                     Prioritize opponents{" "}
                     <Checkbox enabled={prioritizeOpponents} />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
         <RoundInput
            value={teamQuery}
            setValue={setTeamQuery}
            placeholder="Search teams..."
            type="text"
            cornerStyle="sharp"
            style={{
               height: "3.25rem",
               backgroundColor: "var(--inset)",
               border: "2px solid var(--text-background)",
            }}
            icon={<i className="fa-solid fa-magnifying-glass" />}
            iconActive={true}
         />
         <div className={styles.teamsContainer}>
            {queriedTeams && queriedTeams.map((val, index) => {
               return <TeamAssignmentCard key={index} teamData={val} />;
            })}
            {val?.queryProgress.teamData.isLoading && (
               <div className={styles.loadBox}>
                  Loading teams...
               </div>
            )}
            {val?.queryProgress.teamData.isError && (
               <div className={styles.loadBox}>
                  <i className="fa-regular fa-circle-xmark" />&nbsp; Couldn't
                  load teams
               </div>
            )}
         </div>
      </div>
   );
}

export default TeamList;
