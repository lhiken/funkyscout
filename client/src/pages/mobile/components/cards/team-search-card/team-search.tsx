import { useContext, useState } from "react";
import RoundInput from "../../../../../components/app/input/round-input";
import MobileCardHeader from "../card-universal-components/card-header";
import styles from "./team-search.module.css";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";
import { parseTeamKey } from "../../../../../utils/logic/app";
import { TeamRank } from "../../../../../lib/tba/events";

export default function MobileTeamSearchCard() {
   const [teams] = useState<TeamRank[]>(
      useContext(GlobalTeamDataContext).TBAdata,
   );
   const [teamQuery, setTeamQuery] = useState<string>("");

   const filteredTeams = teamQuery == ""
      ? teams
      : teams?.filter((val) =>
         (val.name + val.key).toLowerCase().includes(teamQuery.toLowerCase())
      );

   return (
      <div className={styles.container}>
         <MobileCardHeader
            titleText="Teams"
            tooltipText="Select a team to view its stats"
         />
         <div className={styles.searchHeader}>
            <RoundInput
               value={teamQuery}
               setValue={setTeamQuery}
               placeholder="Search teams..."
               type="text"
               cornerStyle="sharp"
               style={{
                  backgroundColor: "var(--inset)",
                  height: "3.25rem",
               }}
            />
         </div>
         <div className={styles.teams}>
            {filteredTeams?.map((val) => {
               return <TeamCard team={val} key={val.team} />;
            })}
         </div>
      </div>
   );
}

function TeamCard({ team }: { team: TeamRank }) {
   const data = useContext(GlobalTeamDataContext);
   const teamTBAData = data.TBAdata.find((val) => val.key == team.key);

   return (
      <div className={styles.teamCard}>
         <div className={styles.teamCardHeader}>
            <div
               style={{
                  fontFamily: "Ubuntu Mono",
                  fontSize: "1.15rem",
                  color: "var(--primary)",
               }}
            >
               {parseTeamKey(team.key)}
            </div>
            <div>
               {" | " + teamTBAData?.name}
            </div>
         </div>
         <div
            style={{
               fontFamily: "Ubuntu Mono",
               fontSize: "1.15rem",
               lineHeight: "1rem",
               color: "var(--text-secondary)",
               display: "flex",
               justifyContent: "space-between",
            }}
         >
            Rank #{teamTBAData?.rank}
            <div>
               <i
                  className="fa-solid fa-chevron-right"
                  style={{ color: "var(--primary)", fontSize: "0.95rem" }}
               />
            </div>
         </div>
      </div>
   );
}
