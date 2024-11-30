import { toggleTheme } from "../../../utils/theme";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../../lib/supabase/data";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "motion/react";
import EventCard from "./event-card";
import isMobile from "../../../utils/device";
import styles from "./selector.module.css";
import Tippy from "@tippyjs/react";

function EventSelector() {
   const [, setLocation] = useLocation();

   const storedEvent = localStorage.getItem("event");

   const { isPending, error, data } = useQuery({
      queryKey: ["eventSelectorFetchEvents"],
      queryFn: fetchEvents,
   });

   const [match] = useRoute("/events/new");

   useEffect(() => {
      if (storedEvent && !match) {
         if (isMobile()) {
            setLocation("/m");
         } else {
            setLocation("/dashboard");
         }
      } else if (storedEvent) {
         localStorage.removeItem("event");
      }
   }, [storedEvent, setLocation, match]);

   const [eventQuery, setEventQuery] = useState("");

   const queriedEvents = eventQuery == ""
      ? data
      : data && data.filter((event) =>
         event.alias.toLowerCase().includes(eventQuery.toLowerCase()) ||
         event.event.toLowerCase().includes(eventQuery.toLowerCase())
      );

   return (
      <>
         <div className={styles.frame}>
            <div className={styles.header}>
               <div>
                  <i className="fa-regular fa-compass"></i>
                  &nbsp;&nbsp;Select an event
               </div>
               <button
                  className="theme-selector"
                  style={{
                     color: "var(--surface)",
                     fontSize: "1.05rem",
                  }}
                  onClick={toggleTheme}
               >
                  <Tippy content="Switch theme">
                     <i className="fa-solid fa-circle-half-stroke">
                     </i>
                  </Tippy>
               </button>
            </div>
            <div className={styles.container}>
               <div className={styles.inputWrapper}>
                  <input
                     name="eventQuery"
                     type="text"
                     value={eventQuery}
                     onChange={(input) => setEventQuery(input.target.value)}
                     className={styles.input}
                     placeholder="Search events..."
                     autoComplete="off"
                  />
                  <span className={styles.icon}>
                     <i className="fa-solid fa-magnifying-glass" />
                  </span>
               </div>
            </div>
            <div className={styles.eventsContainer}>
               {error && (
                  <div className={styles.errorMessage}>
                     Could not load events
                  </div>
               )}
               {queriedEvents &&
                  (
                     <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{
                           type: "spring",
                           stiffness: 400,
                           damping: 20,
                        }}
                        className={styles.eventScrollContainer}
                     >
                        {queriedEvents.map((event, index) => {
                           return (
                              <EventCard
                                 event={event.event}
                                 alias={event.alias}
                                 date={event.date}
                                 key={index}
                              />
                           );
                        })}
                     </motion.div>
                  )}
               {isPending &&
                  (
                     <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{
                           type: "spring",
                           stiffness: 400,
                           damping: 20,
                        }}
                        className={styles.eventScrollContainer}
                     >
                        <div className={styles.skeleton} />
                        <div className={styles.skeleton} />
                        <div className={styles.skeleton} />
                     </motion.div>
                  )}
            </div>
         </div>
      </>
   );
}

export default EventSelector;
