import { Route, Switch } from "wouter";
import Inmatch2025 from "./2025/match";

export default function ScoutingInmatch() {
    return (
        <Switch>
            <Route path={"/2025/:matchValue"} component={Inmatch2025}/>
        </Switch>
    )
}