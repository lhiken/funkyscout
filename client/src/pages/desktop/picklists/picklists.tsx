import styles from "./picklists.module.css";
import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchTBAEventTeams } from "../../../lib/tba/events";
import { getEvent } from "../../../utils/logic/app";
import { fetchPicklists } from "../../../lib/supabase/data";
import { Tables } from "../../../lib/supabase/database.types";
import {
   ComparedTeamKeysContext,
   PicklistDataContext,
   TargetPicklistContext,
   TeamFetchedDataContext,
} from "./picklists-context";
import PicklistTab from "./picklist-tab/picklist-tab";
import { Picklist } from "../../../schemas/schema";
import ComparisonTab from "./comparison-box/comparison";

export interface PicklistData {
   picklists: Tables<"event_picklist">[];
   queryProgress: {
      isLoading: boolean;
      isError: boolean;
   };
}

export interface FetchedTeamData {
   teamKeys: string[];
   queryProgress: {
      isLoading: boolean;
      isError: boolean;
   };
}

function PicklistPage() {
   const [picklistData, setPicklistData] = useState<PicklistData>({
      picklists: [],
      queryProgress: {
         isLoading: true,
         isError: false,
      },
   });

   const [fetchedTeamData, setFetchedTeamData] = useState<FetchedTeamData>({
      teamKeys: [],
      queryProgress: {
         isLoading: true,
         isError: false,
      },
   });

   const [comparedTeamKeys, setComparedTeamKeys] = useState<string[]>([])

   const [targetPicklist, setTargetPicklist] = useState<Picklist | undefined>();

   const results = useQueries({
      queries: [
         {
            queryKey: [`picklistFetchPicklists/${getEvent()}`],
            queryFn: () => fetchPicklists(getEvent() || ""),
            refetchOnWindowFocus: false,
         },
         {
            queryKey: [`picklistFetchTeams/${getEvent()}`],
            queryFn: () => fetchTBAEventTeams(getEvent() || ""),
            refetchOnWindowFocus: false,
         },
      ],
   });

   useEffect(() => {
      const [
         picklistsResult,
         teamsResult,
      ] = results;

      setPicklistData((prev) => ({
         ...prev,
         picklists: picklistsResult.data || [],
         queryProgress: {
            isLoading: picklistsResult.isLoading,
            isError: picklistsResult.isError,
         },
      }));

      setFetchedTeamData((prev) => ({
         ...prev,
         teamKeys: teamsResult.data?.map((val) => val.key) || [],
         queryProgress: {
            isLoading: teamsResult.isLoading,
            isError: teamsResult.isError,
         },
      }));

      // This is valid as it only updates when data changes.
      // We could do it some other way but oh well!
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [results.map((res) => res.isFetching).join()]);

   return (
      <PicklistDataContext.Provider
         value={{
            val: picklistData,
            setVal: setPicklistData,
         }}
      >
         <TeamFetchedDataContext.Provider
            value={{
               val: fetchedTeamData,
               setVal: setFetchedTeamData,
            }}
         >
            <TargetPicklistContext.Provider value={{
               val: targetPicklist,
               setVal: setTargetPicklist,
            }}>
               <ComparedTeamKeysContext.Provider value={{
                  val: comparedTeamKeys,
                  setVal: setComparedTeamKeys,
               }}>
                  <div className={styles.container}>
                     <PicklistTab />
                     <ComparisonTab />
                  </div>
               </ComparedTeamKeysContext.Provider>
            </TargetPicklistContext.Provider>
         </TeamFetchedDataContext.Provider>
      </PicklistDataContext.Provider>
   );
}

export default PicklistPage;
