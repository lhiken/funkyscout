import { motion } from "motion/react";
import styles from "./event-info.module.css";
import { Dispatch, SetStateAction } from "react";
import { fetchEventByKey } from "../../../lib/supabase/data";
import { useQuery } from "@tanstack/react-query";
import EventInfoCard from "../../../components/app/user-settings/event-card";
import { useLocation } from "wouter";

function EventInfo(
   { setShowSettings }: { setShowSettings: Dispatch<SetStateAction<boolean>> },
) {
   const [, navigate] = useLocation();

   const { isPending, error, data } = useQuery({
      queryKey: ["getSingleEvent"],
      queryFn: () => fetchEventByKey(localStorage.getItem("event")!),
   });

   return (
      <motion.div
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         exit={{ y: -20, opacity: 0 }}
         transition={{ type: "spring", stiffness: 400, damping: 20 }}
         className={styles.eventInfoContainer}
      >
         <div className={styles.eventInfoHeader}>
            Current Event
            <div
               onClick={() => setShowSettings(false)}
               style={{ fontSize: "1.1rem" }}
            >
               <i
                  className="fa-regular fa-circle-xmark"
                  style={{ cursor: "pointer" }}
               />
            </div>
         </div>
         {data && (
            <EventInfoCard
               alias={data.alias}
               event={data.event}
               date={data.date}
            />
         )}
         {isPending && <div className={styles.eventSkeleton} />}
         {error && <div className={styles.eventError}>An error occured</div>}
         <button
            className={styles.eventChangeButton}
            onClick={() => navigate("~/events/new")}
         >
            Change Event
            <div>
               <i className="fa-solid fa-shuffle" />
            </div>
         </button>
      </motion.div>
   );
}

export default EventInfo;
