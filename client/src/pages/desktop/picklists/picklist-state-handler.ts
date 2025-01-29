import { Tables } from "../../../lib/supabase/database.types";

export function setCurrentPicklist(
   targetPicklist: Tables<"event_picklist"> | undefined,
) {
   setLocalStorageItem("picklist_target_picklist", targetPicklist);
}

export function getCurrentPicklist() {
   return getLocalStorageItem<Tables<"event_picklist"> | undefined>(
      "picklist_target_picklist",
   );
}

export function setComparedTeams(
   teams: { teamKey: string; minimized: boolean }[] | undefined,
) {
   setLocalStorageItem("picklist_compared_teams", teams);
}

export function getComparedTeams() {
   return getLocalStorageItem<
      { teamKey: string; minimized: boolean; pinned: boolean }[] | undefined
   >(
      "picklist_compared_teams",
   );
}

export function setUsedMetrics(metrics: {
   title: string;
   values: { teamKey: string; value: number }[];
   type: "bar" | "box" | "line" | "pie";
}[]) {
   setLocalStorageItem("picklist_graphed_metrics", metrics);
}

export function getUsedMetrics() {
   return getLocalStorageItem<
      {
         title: string;
         values: { teamKey: string; value: number }[];
         type: "bar" | "box" | "line" | "pie";
      }[] | undefined
   >("picklist_graphed_metrics");
}

function getLocalStorageItem<T>(key: string): T | undefined {
   if (localStorage.getItem(key) != "undefined") {
      return JSON.parse(localStorage.getItem(key)!) as T;
   }
}

function setLocalStorageItem<T>(key: string, value: T) {
   localStorage.setItem(key, JSON.stringify(value));
}
