import { useContext, useState } from "react";
import { AssignmentContext, ScheduleContext } from "../../schedule-context";
import styles from "./styles.module.css";
import RoundInput from "../../../../../components/app/input/round-input";
import TeamAssignmentCard from "./team-card";

function TeamList() {
   const { val } = useContext(ScheduleContext);
   const { val: assignedData } = useContext(AssignmentContext);

   const [teamQuery, setTeamQuery] = useState<string>("");

   const queriedTeams = (
      teamQuery
        ? val?.teamData?.filter(
            (team) =>
              team.key.toLowerCase().includes(teamQuery.toLowerCase()) ||
              team.name.toLowerCase().includes(teamQuery.toLowerCase())
          )
        : val?.teamData
    )?.sort((a, b) => {
      const aCount = assignedData?.matchData?.filter((i) => i.team === a.key).length || 0;
      const bCount = assignedData?.matchData?.filter((i) => i.team === b.key).length || 0;
      return bCount - aCount;
    });
    

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-robot" />&nbsp;&nbsp;Event Teams
            </div>
            <div className={styles.settingsContainer}>
               <i
                  className="fa-solid fa-gear"
                  style={{
                     fontSize: "1.25rem",
                  }}
               />
            </div>
         </div>
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
         </div>
      </div>
   );
}

export default TeamList;
