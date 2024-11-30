import { fetchEventTeamEPAs } from "../../../utils/logic/fetch";
import { useQuery } from "@tanstack/react-query";
import RankingTab from "./ranking/ranking";
import styles from "./home.module.css";
import InfoTab from "./info/info";
import MatchesTab from "./matches/matches";
import { TeamDataContext } from "./dashboard-team-context";

// Create the context outside the component to export it

function DashboardHome() {
   const { data } = useQuery({
      queryKey: ["dashboardHomeFetchTeamEPAs"],
      queryFn: () => fetchEventTeamEPAs("2024casf"),
   });

   return (
      <TeamDataContext.Provider value={data || {}}>
         <div className={styles.container}>
            <div className={styles.rightTab}>
               <InfoTab />
               <MatchesTab />
            </div>
            <RankingTab />
         </div>
      </TeamDataContext.Provider>
   );
}

export default DashboardHome;
