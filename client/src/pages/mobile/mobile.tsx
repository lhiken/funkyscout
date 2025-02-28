import { Route, Switch, useLocation } from "wouter";
import ErrorPage from "../main/error/error";
import { useEffect, useState } from "react";
import MobileNavbar from "./components/navbar/navbar";
import MobileDashboard from "./dashboard/dashboard";
import MobileTopbar from "./components/topbar/topbar";
import MobileScoutingPage from "./scouting-page/scouting-page";
import styles from "./mobile.module.css";
import MobileStartPitScouting from "./scouting/prep-pages/pit-scouting";
import MobileStartMatchScouting from "./scouting/prep-pages/match-scouting";
import { fetchSession, logout } from "../../lib/supabase/auth";
import {
   checkDatabaseInitialization,
} from "../../lib/mobile-cache-handler/init";
import MobileSetupPage from "./components/setup/setup";
import ScoutingInmatch from "../scouting/inmatch";
import ScoutingInpit from "../scouting/inpit";
import MobileDataViewer from "./data-viewer/data-viewer";
import MobileScheduleViewer from "./schedule/schedule";
import {
   uploadAllOfflineMatches,
   uploadOfflinePitEntries,
} from "../../lib/supabase/data";
import TeamDataViewer from "./data-viewer/pages/team/team";

function MobileApp() {
   const [renderNavbar, setRenderNavbar] = useState(false);
   const [topbarText, setTopbarText] = useState("");
   const [location, navigate] = useLocation();
   const locationArray = ["/", "/scout", "/data", "/schedule"];

   useEffect(() => {
      if (location != "/practice") {
         fetchSession().then((res) => {
            if (res?.session == null) {
               logout();
               navigate("~/auth");
            }
         });
      }

      if (location == "/") {
         checkDatabaseInitialization().then(() => {
         });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [location]);

   useEffect(() => {
      uploadOfflinePitEntries();
      uploadAllOfflineMatches();
   }, [location]);

   useEffect(() => {
      if (locationArray.includes(location)) {
         setRenderNavbar(true);
      } else {
         setRenderNavbar(false);
      }

      switch (location) {
         case "/":
            setTopbarText("Dashboard");
            break;
         case "/scout":
            setTopbarText("Scouting");
            break;
         case "/data":
            setTopbarText("Data");
            break;
         case "/schedule":
            setTopbarText("Schedule");
            break;
         default:
            setTopbarText("");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [location]);

   return (
      <>
         <Switch>
            <div className={styles.dashboardStyleContainer}>
               <Route path="/" component={MobileDashboard} />
               <Route path="/scout" component={MobileScoutingPage} />
               <Route path="/scout/pit" component={MobileStartPitScouting} />
               <Route path="/setup" component={MobileSetupPage} />
               <Route
                  path="/scout/match/:matchNumber"
                  component={MobileStartMatchScouting}
               />
               <Route path="/data" component={MobileDataViewer} />
               <Route path="/data/team/:team" component={TeamDataViewer} />
               <Route path="/schedule" component={MobileScheduleViewer} />
               <Route path="/inmatch/" component={ScoutingInmatch} nest />
               <Route path="/inpit/" component={ScoutingInpit} nest />
            </div>
            <Route>
               <ErrorPage style={{ height: "calc(100% - 1rem)" }} />
            </Route>
         </Switch>
         {renderNavbar && <MobileNavbar />}
         {topbarText && <MobileTopbar text={topbarText} />}
      </>
   );
}

export default MobileApp;
