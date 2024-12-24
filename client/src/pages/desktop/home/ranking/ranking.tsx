import { useState } from "react";
import styles from "./ranking.module.css";
import { fetchTBAEventTeams } from "../../../../lib/tba/events";
import { getEvent } from "../../../../utils/logic/app";
import { useQuery } from "@tanstack/react-query";
import RankingCard from "./rankingcard";
import SimpleBar from "simplebar-react";
import Skeleton from "../../../../components/app/skeleton/skeleton";

type sortDirection = "highlow" | "lowhigh";

function RankingTab() {
   const [sortDirection, setSortDirection] = useState<sortDirection>(
      "highlow",
   );

   const { isPending, error, data } = useQuery({
      queryKey: ["rankingTabFetchTeams"],
      queryFn: () => fetchTBAEventTeams(getEvent() || ""),
   });

   const sortedTeams = data
      ? sortDirection == "highlow"
         ? data.sort((a, b) => a.rank - b.rank)
         : data.sort((a, b) => b.rank - a.rank)
      : [];

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div className={styles.headerText}>
               <i className="fa-solid fa-trophy" />
               Event Rankings
            </div>
            <button
               className={styles.headerIcon}
               onClick={() =>
                  sortDirection == "highlow"
                     ? setSortDirection("lowhigh")
                     : setSortDirection("highlow")}
            >
               {sortDirection == "highlow"
                  ? <i className="fa-solid fa-arrow-down-1-9" />
                  : <i className="fa-solid fa-arrow-up-9-1" />}
            </button>
         </div>
         <div className={styles.seperator} />
         {!error && (
            <SimpleBar className={styles.cardContainer}>
               {sortedTeams &&
                  sortedTeams.map((team, index) => (
                     <RankingCard key={index} team={team} />
                  ))}
               {isPending && (
                  <>
                     <Skeleton
                        style={{
                           height: "4rem",
                           borderRadius: "0",
                           marginBottom: "1rem",
                        }}
                     />
                     <Skeleton
                        style={{
                           height: "4rem",
                           borderRadius: "0",
                           marginBottom: "1rem",
                        }}
                     />
                  </>
               )}
            </SimpleBar>
         )}
         {error && (
            <div className={styles.rankingError}>
               Couldn't load rankings
            </div>
         )}
      </div>
   );
}

export default RankingTab;
