import { Route, Switch, useLocation } from "wouter";
import ErrorPage from "../main/error/error";
import { useEffect, useState } from "react";
import MobileNavbar from "./components/navbar/navbar";
import MobileDashboard from "./dashboard/dashboard";
import MobileTopbar from "./components/topbar/topbar";

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
            setTopbarText("Dashboard")
            break;
         case "/scout":
            setTopbarText("Scouting")
            break;
         default: 
            setTopbarText("");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [location]);

   

   return (
      <>
         <Switch>
            <Route path="/" component={MobileDashboard} />
            <Route path="/scout" />
            <Route>
               <ErrorPage style={{ height: "calc(100% - 1rem)" }} />
            </Route>
         </Switch>
         {renderNavbar && <MobileNavbar />}
         {topbarText && <MobileTopbar text={topbarText}/>}
      </>
   );
}

export default MobileApp;
