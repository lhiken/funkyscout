import { createContext, Dispatch, SetStateAction } from "react";
import { FetchedTeamData, PicklistData } from "./picklists";
import { Picklist } from "../../../schemas/schema";

export const PicklistDataContext = createContext<{
   val?: PicklistData;
   setVal?: Dispatch<SetStateAction<PicklistData>>;
}>({});

export const TeamFetchedDataContext = createContext<{
   val?: FetchedTeamData;
   setVal?: Dispatch<SetStateAction<FetchedTeamData>>;
}>({});

export const TargetPicklistContext = createContext<{
   val?: Picklist,
   setVal?: Dispatch<SetStateAction<Picklist | undefined>>;
}>({});

export const ComparedTeamKeysContext = createContext<{
   val?: string[],
   setVal?: Dispatch<SetStateAction<string[]>>
}>({});