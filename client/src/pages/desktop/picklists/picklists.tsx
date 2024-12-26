import styles from "./picklists.module.css";
import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getEvent } from "../../../utils/logic/app";
import { deletePicklist, fetchPicklists } from "../../../lib/supabase/data";
import { Tables } from "../../../lib/supabase/database.types";
import {
   ComparedTeamKeysContext,
   PicklistCommandContext,
   PicklistDataContext,
   TargetPicklistContext,
} from "./picklists-context";
import PicklistTab from "./picklist-tab/picklist-tab";
import ComparisonTab from "./comparison-box/comparison";
import { Picklist } from "../../../schemas/schema";
import throwNotification from "../../../components/app/toast/toast";

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

export interface PicklistCommands {
   moveTeamUp: (teamKey: string) => void;
   moveTeamDown: (teamKey: string) => void;
   excludeTeam: (teamKey: string) => void;
   renamePicklist: (name: string) => void;
   deletePicklist: () => void;
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

   const picklistCommands: PicklistCommands = {
      moveTeamUp: (teamKey: string) => {
         setTargetPicklist((prev) => {
            if (!prev) return prev;
            const picklist = prev.picklist as Picklist;
            const index = picklist.findIndex((team) =>
               team.teamKey === teamKey
            );
            if (index > 0) {
               const newPicklist = [...picklist];
               let targetIndex = index - 1;
               while (targetIndex >= 0 && newPicklist[targetIndex].excluded) {
                  targetIndex--;
               }
               if (targetIndex >= 0) {
                  [newPicklist[targetIndex], newPicklist[index]] = [
                     newPicklist[index],
                     newPicklist[targetIndex],
                  ];
               }
               return { ...prev, picklist: newPicklist };
            }
            return prev;
         });
      },

      moveTeamDown: (teamKey: string) => {
         setTargetPicklist((prev) => {
            if (!prev) return prev;
            const picklist = prev.picklist as Picklist;
            const index = picklist.findIndex((team) =>
               team.teamKey === teamKey
            );
            if (index < picklist.length - 1) {
               const newPicklist = [...picklist];
               let targetIndex = index + 1;
               while (
                  targetIndex < newPicklist.length &&
                  newPicklist[targetIndex].excluded
               ) {
                  targetIndex++;
               }
               if (targetIndex < newPicklist.length) {
                  [newPicklist[targetIndex], newPicklist[index]] = [
                     newPicklist[index],
                     newPicklist[targetIndex],
                  ];
               }
               return { ...prev, picklist: newPicklist };
            }
            return prev;
         });
      },

      excludeTeam: (teamKey: string) => {
         setTargetPicklist((prev) => {
            if (!prev) return prev;
            const picklist = prev.picklist as Picklist;
            const index = picklist.findIndex((team) =>
               team.teamKey === teamKey
            );
            if (index !== -1) {
               const newPicklist = [...picklist];
               newPicklist[index].excluded = !newPicklist[index].excluded;
               return { ...prev, picklist: newPicklist };
            }
            return prev;
         });
      },

      renamePicklist: (name: string) => {
         setPicklistData((prev) => {
            const newPicklists = prev.picklists.map((picklist) => {
               if (picklist === targetPicklist) {
                  return { ...picklist, name };
               }
               return picklist;
            });
            return { ...prev, picklists: newPicklists };
         });
      },

      deletePicklist: () => {
         if (targetPicklist) {
            const picklistName = targetPicklist.title;
            deletePicklist(targetPicklist).then((res) => {
               if (res) {
                  throwNotification("success", `Deleted "${picklistName}"`);
               }
            });
         }
         setPicklistData((prev) => {
            return {
               ...prev,
               picklists: prev.picklists.filter((picklist) =>
                  picklist !== targetPicklist
               ),
            };
         });
         setTargetPicklist(undefined);
      },
   };

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
               <PicklistCommandContext.Provider value={picklistCommands}>
                  <div className={styles.container}>
                     <PicklistTab />
                     <ComparisonTab />
                  </div>
               </PicklistCommandContext.Provider>
            </ComparedTeamKeysContext.Provider>
         </TargetPicklistContext.Provider>
      </PicklistDataContext.Provider>
   );
}

export default PicklistPage;
