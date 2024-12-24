import { Route, Switch } from "wouter";
import ErrorPage from "../main/error/error";

function MobileApp() {
   return (
      <>
         <Switch>
            <Route path="/dashboard" nest />
            <Route path="/scout" />
            <Route>
               <ErrorPage style={{ height: "calc(100% - 1rem)" }} />
            </Route>
         </Switch>
      </>
   );
}

export default MobileApp;
