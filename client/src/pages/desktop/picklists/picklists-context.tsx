import { createContext, Dispatch, SetStateAction } from "react";
import { FetchedTeamData, PicklistData } from "./picklists";

export const PicklistDataContext = createContext<{
   val?: PicklistData;
   setVal?: Dispatch<SetStateAction<PicklistData>>;
}>({});

export const TeamFetchedDataContext = createContext<{
   val?: FetchedTeamData;
   setVal?: Dispatch<SetStateAction<FetchedTeamData>>;
}>({});