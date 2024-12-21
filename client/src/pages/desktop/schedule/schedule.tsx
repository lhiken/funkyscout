import { useEffect, useState } from "react";
import { AssignmentContext, ScheduleContext } from "./schedule-context";
import TeamList from "./tabs/team-list/team-list";
import { Tables } from "../../../lib/supabase/database.types";
import styles from "./schedule.module.css";
import SetupPanel from "./tabs/schedule-setup/schedule-setup";
import ScheduleTable from "./tabs/schedule-table/schedule-table";
import { useQueries } from "@tanstack/react-query";
import { getEvent } from "../../../utils/logic/app";
import {
   EventSchedule,
   fetchTBAEventTeams,
   fetchTBAMatchSchedule,
   TeamRank,
} from "../../../lib/tba/events";
import { fetchAllUserDetails } from "../../../lib/supabase/users";
import {
   fetchMatchAssignments,
   fetchTeamAssignments,
} from "../../../lib/supabase/data";

interface ScheduleContextType {
   teamData?: TeamRank[];
   userData?: Tables<"user_profiles">[];
   matchData?: EventSchedule;
   queryProgress: {
      teamData: {
         isLoading: boolean;
         isError: boolean;
      };
      userData: {
         isLoading: boolean;
         isError: boolean;
      };
   };
}

interface AssignmentData {
   teamData: Tables<"event_team_data">[];
   matchData: Tables<"event_schedule">[];
   priorityTeams: string[];
   scouterList: { name: string; uid: string }[];
}

function SchedulePage() {
   const [scheduleData, setScheduleData] = useState<ScheduleContextType>({
      queryProgress: {
         teamData: {
            isLoading: true,
            isError: false,
         },
         userData: {
            isLoading: true,
            isError: false,
         },
      },
   });

   const [assignmentData, setAssignmentData] = useState<AssignmentData>({
      teamData: [],
      matchData: [],
      priorityTeams: [],
      scouterList: [],
   });

   const results = useQueries({
      queries: [
         {
            queryKey: [`scheduleFetchTeams/${getEvent()}`],
            queryFn: () => fetchTBAEventTeams(getEvent() || ""),
            refetchOnWindowFocus: false,
         },
         {
            queryKey: [`scheduleFetchUsers/${getEvent()}`],
            queryFn: () => fetchAllUserDetails(),
            refetchOnWindowFocus: false,
         },
         {
            queryKey: [`scheduleFetchMatches/${getEvent()}`],
            queryFn: () => fetchTBAMatchSchedule(getEvent() || ""),
            refetchOnWindowFocus: false,
         },
         {
            queryKey: [`scheduleFetchAssignedTeams/${getEvent()}`],
            queryFn: () => fetchTeamAssignments(getEvent() || ""),
            refetchOnWindowFocus: false,
         },
         {
            queryKey: [`scheduleFetchAssignedMatches/${getEvent()}`],
            queryFn: () => fetchMatchAssignments(getEvent() || ""),
            refetchOnWindowFocus: false,
         },
      ],
   });

   useEffect(() => {
      const [
         teamsResult,
         usersResult,
         matchesResult,
         assignedTeams,
         assignedMatches,
      ] = results;

      setScheduleData((prev) => ({
         ...prev,
         teamData: teamsResult.data,
         userData: usersResult.data
            ? usersResult.data.filter((val) => val.role == "scouter")
            : [],
         matchData: matchesResult.data,
         queryProgress: {
            teamData: {
               isLoading: teamsResult.isLoading,
               isError: teamsResult.isError,
            },
            userData: {
               isLoading: usersResult.isLoading,
               isError: usersResult.isError,
            },
         },
      }));

      setAssignmentData((prev) => ({
         ...prev,
         teamData: assignedTeams.data || [],
         matchData: assignedMatches.data || [],
         scouterList: Array.from(
            new Map(
               (assignmentData.matchData || [])
                  .filter((val) => val.uid && val.name)
                  .filter((val) =>
                     usersResult.data
                        ? usersResult.data.filter((val) =>
                           val.role == "scouter"
                        ).map((val) => val.uid).includes(
                           val.uid || "",
                        )
                        : ""
                  )
                  .map((val) => [val.uid, { name: val.name!, uid: val.uid! }]),
            ).values(),
         ),
      }));

      console.log(assignmentData);

      // This is valid as it only updates when data changes.
      // We could do it some other way but oh well!
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [results.map((res) => res.isFetching).join()]);

   return (
      <ScheduleContext.Provider
         value={{ val: scheduleData, setVal: setScheduleData }}
      >
         <AssignmentContext.Provider
            value={{ val: assignmentData, setVal: setAssignmentData }}
         >
            <div className={styles.scheduleContainer}>
               <SetupPanel />
               <ScheduleTable />
               <TeamList />
            </div>
         </AssignmentContext.Provider>
      </ScheduleContext.Provider>
   );
}

export default SchedulePage;
export type { AssignmentData, ScheduleContextType };
