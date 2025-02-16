import {useContext, useState} from "react";
import { matchQuery } from "@tanstack/react-query";
import RoundInput from "../../../components/app/input/round-input";
import style from "../schedule/tabs/team-list/styles.module.css";
function Team()
{
    const [matchQuery, setMatchQuery] = useState<string>("");
    return (
        <div className = {style.container}>
            <div className = {style.header}>
                <div>
                    <i className = "fa-solid fa-trophy" />&nbsp;&nbsp;Event Teams
                </div>
            </div>
            <RoundInput
                value = {matchQuery}
                setValue = {setMatchQuery}
                placeholder="Search teams"
                type = "text"
                cornerStyle="sharp"
                style={{
                    height: "3.25rem",
                    backgroundColor:"var(--inset)",
                    border: "2px solid var(--text-background)"
                }}
                icon = {<i className = "fa-solid fa-magnifying-glass"/>}
                iconActive={true}
            />
        </div>
    )
}
export default Team;