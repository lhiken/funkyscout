import { useContext, useEffect, useState } from "react";
import RoundInput from "../../../../../components/app/input/round-input";
import MobileCardHeader from "../card-universal-components/card-header";
import styles from "./team-search.module.css";
import { Tables } from "../../../../../lib/supabase/database.types";
import {
   getAllData,
   getTeamDetailsStoreName,
} from "../../../../../lib/mobile-cache-handler/init";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";
import { parseTeamKey } from "../../../../../utils/logic/app";

export default function MobileTeamSearchCard() {
   const [teams, setTeams] = useState<Tables<"event_team_data">[]>();
   const [teamQuery, setTeamQuery] = useState<string>("");

   useEffect(() => {
      getAllData<Tables<"event_team_data">>(getTeamDetailsStoreName()).then(
         (res) => {
            setTeams(res);
         },
      );
   }, []);

   const filteredTeams = teamQuery == ""
      ? teams
      : teams?.filter((val) =>
         val.team.toLowerCase().includes(teamQuery.toLowerCase())
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

function TeamCard({ team }: { team: Tables<"event_team_data"> }) {
   const data = useContext(GlobalTeamDataContext);
   const teamTBAData = data.TBAdata.find((val) => val.key == team.team);

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
               {parseTeamKey(team.team)}
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
            }}
         >
            #{teamTBAData?.rank}
         </div>
      </div>
   );
}
