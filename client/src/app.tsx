import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { updateTheme } from "./utils/theme";
import AuthPage from "./pages/main/auth/auth";
import Dashboard from "./pages/desktop/dashboard";
import { getLocalUserData } from "./lib/supabase/auth";
import ErrorPage from "./pages/main/error/error";
import EventSelector from "./pages/main/event-selector/event-selector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "tippy.js/dist/tippy.css";
import 'simplebar-react/dist/simplebar.min.css';
import MobileApp from "./pages/mobile/mobile";
import isMobile from "./utils/device";

const queryClient = new QueryClient();

export default function App() {
   useEffect(() => {
      updateTheme();
   }, []);

   const [location, setLocation] = useLocation();

   useEffect(() => {
      const pathRegex = /^(\/|\/auth(\/|\/verify)?)$/;

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

   return (
      <>
         <QueryClientProvider client={queryClient}>
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
         </QueryClientProvider>
      </>
   );
}
