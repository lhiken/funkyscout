import { useQuery } from "@tanstack/react-query";
import MatchCard from "./matchcard";
import styles from "./styles.module.css";
import { getNexusEventStatus } from "../../../../lib/nexus/events";
import Skeleton from "../../../../components/app/skeleton/skeleton";
import { getEvent } from "../../../../utils/logic/app";

function MatchesTab() {
   const { isPending, error, data } = useQuery({
      queryKey: ["matchesTabFetchMatches"],
      queryFn: () => getNexusEventStatus(getEvent() || ""),
   });

   const matches = data
      ? data.matches
         .filter((match) =>
            match.status != "On field" ||
            (
               match.times.actualOnFieldTime &&
               Date.now() - match.times.actualOnFieldTime < 1000 * 60
            )
         )
         .sort((a, b) =>
            a.times.estimatedQueueTime - b.times.estimatedQueueTime
         )
      : [];

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-crosshairs" />&nbsp;&nbsp;Upcoming
               Matches
            </div>
            <div className={styles.selectorBreadcrumb}>
               <i className="fa-solid fa-caret-down" />&nbsp;&nbsp;All Matches
            </div>
         </div>
         <div className={styles.matchContainer}>
            {!error && !isPending && matches.length == 0 && (
               <div className={styles.matchError}>No upcoming matches</div>
            )}
            {data &&
               matches.map((match, index) => (
                  <MatchCard key={index} match={match} />
               ))}
            {isPending &&
               Array.from({ length: 4 }, (_, index) => (
                  <Skeleton
                     key={index}
                     style={{
                        height: "100%",
                        width: "21rem",
                        border: "2px solid var(--text-background)",
                        flexShrink: 0,
                     }}
                  />
               ))}
            {error && (
               <div className={styles.matchError}>Couldn't load matches</div>
            )}
         </div>
      </div>
   );
}

export default MatchesTab;
