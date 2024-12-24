import { createContext, Dispatch, SetStateAction } from "react";
import { FetchedTeamData, PicklistData } from "./picklists";
import { Tables } from "../../../lib/supabase/database.types";

export const PicklistDataContext = createContext<{
   val?: PicklistData;
   setVal?: Dispatch<SetStateAction<PicklistData>>;
}>({});

export const TeamFetchedDataContext = createContext<{
   val?: FetchedTeamData;
   setVal?: Dispatch<SetStateAction<FetchedTeamData>>;
}>({});

export const TargetPicklistContext = createContext<{
   val?: Tables<"event_picklist">;
   setVal?: Dispatch<SetStateAction<Tables<"event_picklist"> | undefined>>;
}>({});

export const ComparedTeamKeysContext = createContext<{
   val?: string[];
   setVal?: Dispatch<SetStateAction<string[]>>;
}>({});
