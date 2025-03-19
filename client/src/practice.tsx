import { Route, Switch, useLocation } from "wouter";
import Inmatch2025 from "./pages/scouting/2025/match";
import { useEffect } from "react";
import { logout } from "./lib/supabase/auth";

export default function PracticeMode() {
   return (
      <Switch>
         <Route path="/" component={PracticeInfo} />
         <Route path="/match/:params" component={Inmatch2025} />
      </Switch>
   );
}

function PracticeInfo() {
   const [, navigate] = useLocation();

   useEffect(() => {
      logout();
   }, []);

   return (
      <div className="practiceContainer">
         <div className="practiceHeader">
            Practice Mode
         </div>
         <div
            className="practiceButton"
            onClick={() => navigate("/match/m=2024casf_qm1&t=frc254&a=b")}
         >
            Blue Alliance
         </div>
         <div
            className="practiceButton"
            onClick={() => navigate("/match/m=2024casf_qm1&t=frc254&a=r ")}
         >
            Red Alliance
         </div>
         <div className="returnButton" onClick={() => navigate("~/")}>
            Return
         </div>
      </div>
   );
}
