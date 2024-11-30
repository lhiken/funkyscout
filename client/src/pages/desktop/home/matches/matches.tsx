import { useQuery } from "@tanstack/react-query";
import MatchCard from "./matchcard";
import styles from "./styles.module.css";
import { getNexusEventStatus } from "../../../../lib/nexus/events";

function MatchesTab() {
   const { isPending, error, data } = useQuery({
      queryKey: ["matchesTabFetchMatches"],
      queryFn: () => getNexusEventStatus("demo8631"),
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
               <i className="fa-solid fa-crosshairs" />&nbsp;&nbsp; Upcoming
               Matches
            </div>
         </div>
         <div className={styles.matchContainer}>
            {data &&
               matches.map((match, index) => (
                  <MatchCard key={index} match={match} />
               ))}
            {isPending && "loading"}
            {error && "Error loading"}
         </div>
      </div>
   );
}

export default MatchesTab;
