import { Route, Switch, useLocation } from "wouter";
import ErrorPage from "../main/error/error";
import { useEffect, useState } from "react";
import MobileNavbar from "./components/navbar/navbar";

function MobileApp() {
   const [renderNavbar, setRenderNavbar] = useState(false);
   const [location] = useLocation();
   const locationArray = ["/dashboard"]

   useEffect(() => {
      if (locationArray.includes(location)) {
         setRenderNavbar(true);
      } else {
         setRenderNavbar(false);
      }
   }, [location])

   return (
      <>
         <Switch>
            <Route path="/dashboard" nest />
            <Route path="/scout" />
            <Route>
               <ErrorPage style={{ height: "calc(100% - 1rem)" }} />
            </Route>
            {renderNavbar && <MobileNavbar/> }            
         </Switch>
      </>
   );
}

export default MobileApp;
