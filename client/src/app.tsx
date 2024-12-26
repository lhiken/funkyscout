import { Route, Switch, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { updateTheme } from "./utils/theme";
import AuthPage from "./pages/main/auth/auth";
import Dashboard from "./pages/desktop/dashboard";
import { getLocalUserData } from "./lib/supabase/auth";
import ErrorPage from "./pages/main/error/error";
import EventSelector from "./pages/main/event-selector/event-selector";
import { useQueries } from "@tanstack/react-query";
import "tippy.js/dist/tippy.css";
import "simplebar-react/dist/simplebar.min.css";
import MobileApp from "./pages/mobile/mobile";
import isMobile from "./utils/device";
import { getEvent, getFocusTeam, setFocusTeam } from "./utils/logic/app";
import { fetchEventTeamEPAs } from "./lib/statbotics/event-teams";
import { fetchTBAEventTeams, TeamRank } from "./lib/tba/events";
import {
   fetchMatchDataByEvent,
   fetchTeamDataByEvent,
} from "./lib/supabase/data";
import { StatboticsTeamEPAs } from "./lib/statbotics/teams";
import { Tables } from "./lib/supabase/database.types";
import { GlobalTeamDataContext } from "./app-global-ctx";

export interface GlobalTeamData {
   EPAdata: Record<string, StatboticsTeamEPAs>;
   TBAdata: TeamRank[];
   InternalMatchData: Tables<"event_match_data">[];
   InternalTeamData: Tables<"event_team_data">[];
   progress: {
      EPAloading: boolean;
      EPAerror: boolean;
      TBAloading: boolean;
      TBAerror: boolean;
      MatchLoading: boolean;
      MatchError: boolean;
      TeamLoading: boolean;
      TeamError: boolean;
   };
   refetch: () => void;
}

export default function App() {
   useEffect(() => {
      updateTheme();
   }, []);

   const [location, setLocation] = useLocation();

   useEffect(() => {
      const pathRegex = /^(\/|\/auth(\/|\/verify)?)$/;

      if (!getFocusTeam()) {
         setFocusTeam("846");
      }

      if (pathRegex.test(location) && getLocalUserData().uid) {
         if (isMobile()) {
            setLocation("/m");
         } else {
            setLocation("/dashboard");
         }
      } else if (pathRegex.test(location)) {
         setLocation("/auth");
      }
   }, [location, setLocation]);

   const [teamData, setTeamData] = useState<GlobalTeamData>({
      EPAdata: {},
      TBAdata: [],
      InternalMatchData: [],
      InternalTeamData: [],
      progress: {
         EPAloading: true,
         EPAerror: false,
         TBAloading: true,
         TBAerror: false,
         MatchLoading: true,
         MatchError: false,
         TeamLoading: true,
         TeamError: false,
      },
      refetch: () => {},
   });

   const results = useQueries({
      queries: [
         {
            queryKey: [`appFetchEPA/${getEvent()}`],
            queryFn: () => fetchEventTeamEPAs(getEvent() || ""),
            refetchOnWindowFocus: false,
            refetchInterval: 120000,
         },
         {
            queryKey: [`appFetchTBA/${getEvent()}`],
            queryFn: () => fetchTBAEventTeams(getEvent() || ""),
            refetchOnWindowFocus: false,
            refetchInterval: 120000,
         },
         {
            queryKey: [`appFetchMatchData/${getEvent()}`],
            queryFn: () => fetchMatchDataByEvent(getEvent() || ""),
            refetchOnWindowFocus: false,
            refetchInterval: 120000,
         },
         {
            queryKey: [`appFetchTeamData/${getEvent()}`],
            queryFn: () => fetchTeamDataByEvent(getEvent() || ""),
            refetchOnWindowFocus: false,
            refetchInterval: 120000,
         },
      ],
   });

   useEffect(() => {
      const [EPAdata, TBAdata, InternalMatchData, InternalTeamData] = results;

      setTeamData({
         EPAdata: EPAdata.data || {},
         TBAdata: TBAdata.data || [],
         InternalMatchData: InternalMatchData.data || [],
         InternalTeamData: InternalTeamData.data || [],
         progress: {
            EPAloading: EPAdata.isLoading,
            EPAerror: EPAdata.isError,
            TBAloading: TBAdata.isLoading,
            TBAerror: TBAdata.isError,
            MatchLoading: InternalMatchData.isLoading,
            MatchError: InternalMatchData.isError,
            TeamLoading: InternalTeamData.isLoading,
            TeamError: InternalTeamData.isError,
         },
         refetch: () => {
            TBAdata.refetch();
            InternalMatchData.refetch();
            InternalTeamData.refetch();
            fetchEventTeamEPAs(getEvent() || "", () => {}, true).then(() =>
               EPAdata.refetch()
            );
         },
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [results.map((res) => res.isFetching).join()]);

   return (
      <>
         <GlobalTeamDataContext.Provider value={teamData}>
            <div className="app">
               <Switch>
                  <Route path="/auth" component={AuthPage} />
                  <Route path="/auth/verify" component={AuthPage} />
                  <Route path="/events" component={EventSelector} />
                  <Route path="/events/new" component={EventSelector} />
                  <Route path="/dashboard" component={Dashboard} nest />
                  <Route path="/m" component={MobileApp} nest />
                  <Route>
                     <ErrorPage />
                  </Route>
               </Switch>
            </div>
         </GlobalTeamDataContext.Provider>
      </>
   );
}
