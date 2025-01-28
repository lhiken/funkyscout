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

function MobileApp() {
   const [renderNavbar, setRenderNavbar] = useState(false);
   const [topbarText, setTopbarText] = useState("");
   const [location] = useLocation();
   const locationArray = ["/", "/scout"];

   useEffect(() => {
      console.log(location);
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
               <Route
                  path="/scout/match"
                  component={MobileStartMatchScouting}
               />
               <Route path="/data" />
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
