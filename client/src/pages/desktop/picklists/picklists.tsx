import styles from "./picklists.module.css";
import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getEvent } from "../../../utils/logic/app";
import { fetchPicklists } from "../../../lib/supabase/data";
import { Tables } from "../../../lib/supabase/database.types";
import {
   ComparedTeamKeysContext,
   PicklistDataContext,
   TargetPicklistContext,
} from "./picklists-context";
import PicklistTab from "./picklist-tab/picklist-tab";
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

   const [comparedTeamKeys, setComparedTeamKeys] = useState<string[]>([]);

   const [targetPicklist, setTargetPicklist] = useState<
      Tables<"event_picklist"> | undefined
   >();

   const results = useQueries({
      queries: [
         {
            queryKey: [`picklistFetchPicklists/${getEvent()}`],
            queryFn: () => fetchPicklists(getEvent() || ""),
            refetchOnWindowFocus: false,
         },
      ],
   });

   useEffect(() => {
      const [
         picklistsResult,
      ] = results;

      setPicklistData((prev) => ({
         ...prev,
         picklists: picklistsResult.data || [],
         queryProgress: {
            isLoading: picklistsResult.isLoading,
            isError: picklistsResult.isError,
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
         <TargetPicklistContext.Provider
            value={{
               val: targetPicklist,
               setVal: setTargetPicklist,
            }}
         >
            <ComparedTeamKeysContext.Provider
               value={{
                  val: comparedTeamKeys,
                  setVal: setComparedTeamKeys,
               }}
            >
               <div className={styles.container}>
                  <PicklistTab />
                  <ComparisonTab />
               </div>
            </ComparedTeamKeysContext.Provider>
         </TargetPicklistContext.Provider>
      </PicklistDataContext.Provider>
   );
}

export default PicklistPage;
