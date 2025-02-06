import { createContext, useContext } from "react";
import { useParams } from "wouter"
import styles from './match.module.css';
import { parseMatchKey, parseTeamKey } from "../../../utils/logic/app";
import { motion } from "motion/react";

const MatchInfoContext = createContext<{
    matchKey: string,
    teamKey: string,
    alliance: "red" | "blue"
} | null>(null);

export default function Inmatch2025() {
    const matchInfo = parseMatchString(useParams()[0] || "");

    return (
        <MatchInfoContext.Provider value={matchInfo}>
            <motion.div
                initial={{ opacity: 0, size: 0 }}
                animate={{ opacity: 1, size: 1 }}
                transition={{ duration: 0.2 }}
                className={styles.inmatchContainer}>
                <HelperSidebar />
            </motion.div>
        </MatchInfoContext.Provider>
    )
}

function HelperSidebar() {
    const matchInfo = useContext(MatchInfoContext);

    return (
        <div className={styles.helperSidebar}>
            <div className={styles.helperSidebarHeader}>
                <div style={{ color: "var(--primary)" }}>{parseMatchKey(matchInfo?.matchKey || "", "short").split(" ")[0].substring(0, 1) + parseMatchKey(matchInfo?.matchKey || "", "short").split(" ")[1]}
                </div>
                {parseTeamKey(matchInfo?.teamKey || "")}
            </div>
            <div className={styles.helperSidebarIcons}>
                <img
                    src={"/app/icons/algae.svg"}
                    alt="Medal icon"
                    className={styles.buttonIcon}
                />
                <img
                    src={"/app/icons/coral.svg"}
                    alt="Medal icon"
                    className={styles.buttonIcon}
                />
            </div>
            <div className={styles.helperSidebarControls}>

            </div>
        </div>
    )
}

function parseMatchString(matchString: string) {
    const params = matchString!.split('&');

    const result: {
        matchKey: string,
        teamKey: string,
        alliance: "red" | "blue"
    } = {
        matchKey: 'n/a',
        teamKey: 'n/a',
        alliance: 'red'
    };

    params.forEach(param => {
        const [key, value] = param.split('=');

        switch (key) {
            case 'm':
                result.matchKey = value;
                break;
            case 't':
                result.teamKey = value.substring(1);
                break;
            case 'a':
                if (value == "r") {
                    result.alliance = "red"
                } else {
                    result.alliance = "blue"
                }
                break;
        }
    });

    return result;
}