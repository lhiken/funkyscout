import isMobile from "../../../utils/device";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import styles from "./selector.module.css";
import { toggleTheme } from "../../../utils/theme";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../../lib/supabase/data";
import EventCard from "./event-card";

function EventSelector() {
   const [, setLocation] = useLocation();

   const storedEvent = localStorage.getItem("event");

   const { isPending, error, data } = useQuery({
      queryKey: ["events"],
      queryFn: fetchEvents,
   });

   const [match] = useRoute("/events/new");

   useEffect(() => {
      if (storedEvent && !match) {
         if (isMobile()) {
            setLocation("/dashboard");
         } else {
            setLocation("/dashboard");
         }
      } else if (storedEvent) {
         localStorage.removeItem("event");
      }
   }, [storedEvent, setLocation, match]);

   const [eventQuery, setEventQuery] = useState("");

   return (
      <>
         <div className={styles.frame}>
            <div className={styles.header}>
               <div>
                  <i className="fa-regular fa-compass"></i>
                  &nbsp;Select an event
               </div>
               <button
                  className="theme-selector"
                  style={{
                     color: "var(--surface)",
                     fontSize: "1.05rem",
                  }}
                  onClick={toggleTheme}
               >
                  <i className="fa-solid fa-circle-half-stroke"></i>
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
                     autoComplete="none"
                  />
                  <span className={styles.icon}>
                     <i className="fa-solid fa-magnifying-glass" />
                  </span>
               </div>
            </div>
            <div className={styles.eventsContainer}>
               <div className={styles.eventScrollContainer}>
                  {error && (
                     <div className={styles.errorMessage}>
                        Could not load events
                     </div>
                  )}
                  {data &&
                     data.map((event, index) => {
                        return (
                           <EventCard
                              event={event.event}
                              alias={event.alias}
                              date={event.date}
                              key={index}
                           />
                        );
                     })}
                  {isPending && (
                     <div className={styles.errorMessage}>
                        Loading...
                     </div>
                  )}
               </div>
            </div>
         </div>
      </>
   );
}

export default EventSelector;
