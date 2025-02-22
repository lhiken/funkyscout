import { Route, Switch } from "wouter";
import Inpit2025 from "./2025/pit";

export default function ScoutingInpit() {
   return (
      <Switch>
         <Route path={"/2025/:matchValue"} component={Inpit2025} />
      </Switch>
   );
}
