import { Route, Router, useLocation } from "wouter";
import { useEffect } from "react";
import { updateTheme } from "./utils/theme";
import AuthPage from "./pages/main/auth/auth";
import Dashboard from "./pages/desktop/dashboard";
import { getLocalUserData } from "./lib/supabase/auth";

export default function App() {
   useEffect(() => {
      updateTheme();
   }, []);

   const [location, setLocation] = useLocation();

   useEffect(() => {
      if ((location == "/" || location == "/auth/") && getLocalUserData().uid) {
         setLocation("/dashboard/");
      } else if (location == "/" || location == "/auth/") {
         setLocation("/auth/");
      }
   }, [setLocation, location]);

   return (
      <>
         <div className="app">
            <Router>
               <Route path="/auth/*" component={AuthPage} />
               <Route path="/dashboard/" component={Dashboard} />
            </Router>
         </div>
      </>
   );
}
