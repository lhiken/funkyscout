import { Route, Router } from "wouter";
import { useEffect } from "react";
import { updateTheme } from "./utils/theme";
import AuthPage from "./pages/main/auth/auth";

export default function App() {
   useEffect(() => {
      updateTheme();
   }, []);

   return (
      <>
         <Router>
            <Route path={"/auth"} component={AuthPage} />
         </Router>
      </>
   );
}
