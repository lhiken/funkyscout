import { createContext } from "react";
import { GlobalTeamData } from "./app";

export const GlobalTeamDataContext = createContext<GlobalTeamData>({
   EPAdata: {},
   TBAdata: [],
   InternalMatchData: [],
   InternalTeamData: [],
});
