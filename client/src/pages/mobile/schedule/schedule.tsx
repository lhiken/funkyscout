import { useEffect, useState } from "react";
import {
   getAllData,
   getLocalTBAData,
   getScheduleStoreName,
} from "../../../lib/mobile-cache-handler/init";
import { Tables } from "../../../lib/supabase/database.types";
import styles from "./schedule.module.css";
import { getLocalUserData } from "../../../lib/supabase/auth";
import {
   getEventYear,
   parseMatchKey,
   parseTeamKey,
   timeFromNow,
} from "../../../utils/logic/app";
import Checkbox from "../../../components/app/buttons/checkbox";
import { motion } from "motion/react";
import { navigate } from "wouter/use-browser-location";

export default function MobileScheduleViewer() {
   const [schedule, setSchedule] = useState<Tables<"event_schedule">[]>();
   const scheduleTBA = getLocalTBAData();

   useEffect(() => {
      getAllData<Tables<"event_schedule">>(getScheduleStoreName()).then(
         (res) => {
            setSchedule(res);
         },
      );
   }, []);

   const [showAll, setShowAll] = useState<boolean>(true);

   const filteredSchedule = schedule?.filter((val) =>
      val.uid == getLocalUserData().uid &&
      (showAll
         ? true
         : (scheduleTBA[val.match].est_time + 3600) * 1000 > Date.now())
   ).sort((a, b) =>
      scheduleTBA[a.match].est_time - scheduleTBA[b.match].est_time
   );

   let lastTime = 0;

   return (
      <motion.div
         className={styles.container}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ type: "spring", duration: 0.5 }}
      >
         <div className={styles.setting}>
            Show past matches{" "}
            <Checkbox enabled={showAll} setEnabled={setShowAll} />
         </div>
         <div className={styles.matches}>
            {filteredSchedule?.length || -1 > 0
               ? filteredSchedule?.flatMap((val, index) => {
                  const currentTime = scheduleTBA[val.match].est_time;
                  const timeDiff = (currentTime - lastTime) / 60;

                  lastTime = currentTime;

                  const breakElement = index > 0 && timeDiff > 15
                     ? (
                        <div className={styles.scheduleCard}>
                           <div style={{ display: "flex", gap: "0.25rem" }}>
                              Break
                              <div style={{ color: "var(--text-secondary)" }}>
                                 |
                              </div>{" "}
                              ~{Math.round(timeDiff)} minutes
                           </div>
                        </div>
                     )
                     : null;

                  return [
                     breakElement,
                     <ScheduleCard
                        key={val.match}
                        schedule={val}
                        time={currentTime}
                     />,
                  ];
               })
               : (
                  <div className={styles.loadBox}>
                     <i className="fa-regular fa-circle-xmark" />&nbsp;&nbsp;No
                     assigned matches
                  </div>
               )}
         </div>
      </motion.div>
   );
}

export function ScheduleCard(
   { schedule, time }: { schedule: Tables<"event_schedule">; time: number },
) {
   const t = timeFromNow(new Date(time * 1000));

   return (
      <div
         className={styles.scheduleCard}
         onClick={() => {
            navigate(
               `/m/inmatch/${getEventYear() || ""}/m=${schedule.match}&t=${
                  schedule.alliance[0].toUpperCase() + schedule.team
               }&a=${schedule.alliance[0]}`,
            );
         }}
      >
         <div className={styles.matchInfo}>
            {parseMatchKey(schedule.match, "nexus")}
            <div className={styles.timeInfo}>
               <div style={{ color: "var(--text-primary)" }}>
                  {t.value} {t.sign == "+" ? "from now" : "ago"}
               </div>{" "}
               <div style={{ color: "var(--text-background)" }}>|</div>{" "}
               <div style={{ color: "var(--text-secondary)" }}>
                  {(new Date(time * 1000)).toLocaleTimeString([], {
                     hour: "numeric",
                     minute: "2-digit",
                     hour12: true,
                  })}
               </div>
               {" "}
            </div>
         </div>
         <div
            className={styles.teamInfo}
            style={{
               color: schedule.alliance == "red"
                  ? "var(--red-alliance)"
                  : "var(--blue-alliance)",
            }}
         >
            {parseTeamKey(schedule.team)}
         </div>
      </div>
   );
}
