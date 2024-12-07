import { useQuery } from "@tanstack/react-query";
import MatchCard from "./matchcard";
import styles from "./styles.module.css";
import { getNexusEventStatus } from "../../../../lib/nexus/events";
import Skeleton from "../../../../components/app/skeleton/skeleton";
import { getFocusTeam } from "../../../../utils/logic/app";
import { useState } from "react";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";

function MatchesTab() {
   const { isPending, error, data } = useQuery({
      queryKey: ["matchesTabFetchMatches"],
      queryFn: () => getNexusEventStatus("demo8631"),
      refetchInterval: 20 * 1000,
      refetchOnWindowFocus: false,
   });

   const [filterFocusOnly, setFilterFocusOnly] = useState(false);

   const matches = data
      ? data.matches
         .filter((match) =>
            filterFocusOnly
               ? match.blueTeams.includes(getFocusTeam() || "") ||
                  match.redTeams.includes(getFocusTeam() || "")
               : true
         )
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

   const [showOptions, setShowOptions] = useState(false);

   function handleDropdownClick() {
      setShowOptions(!showOptions);
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <i className="fa-solid fa-crosshairs" />&nbsp;&nbsp;Upcoming
               Matches
            </div>
            <div className={styles.selectorDropdownContainer}>
               <div
                  className={styles.selectorBreadcrumb}
                  onClick={handleDropdownClick}
               >
                  <i className="fa-solid fa-caret-down" />&nbsp;&nbsp;{" "}
                  {!filterFocusOnly ? "All matches" : getFocusTeam() + " only"}
                  <AnimatePresence>
                     {showOptions &&
                        (
                           <motion.div
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 0, opacity: 0 }}
                              transition={{
                                 type: "spring",
                                 stiffness: 400,
                                 damping: 20,
                              }}
                              className={styles.selectorDropdown}
                              onClick={() =>
                                 filterFocusOnly
                                    ? setFilterFocusOnly(false)
                                    : setFilterFocusOnly(true)}
                           >
                              {filterFocusOnly
                                 ? "All matches"
                                 : getFocusTeam() + " only"}
                           </motion.div>
                        )}
                  </AnimatePresence>
               </div>
            </div>
         </div>
         <div className={styles.matchContainer}>
            {!error && !isPending && matches.length == 0 && (
               <div className={styles.matchError}>
                  <i className="fa-regular fa-circle-xmark" />&nbsp;&nbsp;No
                  upcoming matches
               </div>
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
                        marginRight: "1rem"
                     }}
                  />
               ))}
            {error && (
               <div className={styles.matchError}>
                  <i className="fa-regular fa-circle-xmark" />&nbsp;&nbsp;Couldn't
                  load matches
               </div>
            )}
         </div>
      </div>
   );
}

export default MatchesTab;
