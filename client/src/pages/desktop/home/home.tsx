import { fetchEventTeamEPAs } from "../../../lib/statbotics/event-teams";
import { useQuery } from "@tanstack/react-query";
import RankingTab from "./ranking/ranking";
import styles from "./home.module.css";
import InfoTab from "./info/info";
import MatchesTab from "./matches/matches";
import {
   TeamDataContext,
   TeamDataProgressContext,
} from "./dashboard-team-context";
import { getEvent } from "../../../utils/logic/app";
import { useEffect, useState } from "react";
import { StatboticsTeamEPAs } from "../../../lib/statbotics/teams";

function DashboardHome() {
   const [teamData, setTeamData] = useState<Record<string, StatboticsTeamEPAs>>(
      {},
   );
   const [teamDataProgress, setTeamDataProgress] = useState<{
      fetched: number;
      total: number;
      errors: number;
   }>({ fetched: 0, total: 0, errors: 0 });

   function setProgress(fetched: number, total: number, errors: number) {
      setTeamDataProgress({
         fetched: fetched,
         total: total,
         errors: errors,
      });
   }

   const { isError } = useQuery({
      queryKey: ["dashboardHomeFetchTeamEPAs"],
      queryFn: () =>
         fetchEventTeamEPAs(getEvent() || "", setProgress).then((res) => {
            if (res) {
               setTeamData(res);
               return true; // Query is successful
            } else {
               return false; // Query is unsuccessful
            }
         }),
   });

   useEffect(() => {
      if (isError) {
         setTeamDataProgress((prev) => ({ ...prev, error: true }));
      }
   }, [isError]);

   return (
      <TeamDataContext.Provider value={teamData || {}}>
         <TeamDataProgressContext.Provider value={teamDataProgress || {}}>
            <div className={styles.container}>
               <div className={styles.rightTab}>
                  <InfoTab />
                  <MatchesTab />
               </div>
               <RankingTab />
            </div>
         </TeamDataProgressContext.Provider>
      </TeamDataContext.Provider>
   );
}

export default DashboardHome;
