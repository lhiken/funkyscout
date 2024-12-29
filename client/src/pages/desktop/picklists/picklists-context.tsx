import { createContext, Dispatch, SetStateAction } from "react";
import { PicklistCommands, PicklistData } from "./picklists";
import { Tables } from "../../../lib/supabase/database.types";

export const PicklistDataContext = createContext<{
   val?: PicklistData;
   setVal?: Dispatch<SetStateAction<PicklistData>>;
}>({});

export const TargetPicklistContext = createContext<{
   val?: Tables<"event_picklist">;
   setVal?: Dispatch<SetStateAction<Tables<"event_picklist"> | undefined>>;
}>({});

export const ComparedTeamKeysContext = createContext<{
   val?: string[];
   setVal?: Dispatch<SetStateAction<string[]>>;
}>({});

export const PicklistCommandContext = createContext<PicklistCommands>({
   moveTeamUp: () => {},
   moveTeamDown: () => {},
   excludeTeam: () => {},
   changePicklistVisibility: () => {},
   renamePicklist: () => {},
   deletePicklist: () => {},
});
