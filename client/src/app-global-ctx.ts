import { createContext } from "react";
import { GlobalTeamData } from "./app";

export const GlobalTeamDataContext = createContext<GlobalTeamData>({
   EPAdata: {},
   TBAdata: [],
   InternalMatchData: [],
   InternalTeamData: [],
   COPRdata: {},
   progress: {
      EPAloading: true,
      EPAerror: false,
      TBAloading: true,
      TBAerror: false,
      MatchLoading: true,
      MatchError: false,
      TeamLoading: true,
      TeamError: false,
      COPRloading: true,
      COPRerror: false,
   },
   refetch: () => {},
});
