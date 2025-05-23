import { useState } from "react";
import RoundInput from "../../../components/app/input/round-input";
import style from "../schedule/tabs/team-list/styles.module.css";
function Matches() {
   const [matchQuery, setMatchQuery] = useState<string>("");
   return (
      <div className={style.container}>
         <div className={style.header}>
            <div>
               <i className="fa-solid fa-crosshairs" />&nbsp;&nbsp;Event Matches
            </div>
         </div>
         <RoundInput
            value={matchQuery}
            setValue={setMatchQuery}
            placeholder="Search matches"
            type="text"
            cornerStyle="sharp"
            style={{
               height: "3.25rem",
               backgroundColor: "var(--inset)",
               border: "2px solid var(--text-background)",
            }}
            icon={<i className="fa-solid fa-magnifying-glass" />}
            iconActive={true}
         />
      </div>
   );
}
export default Matches;
