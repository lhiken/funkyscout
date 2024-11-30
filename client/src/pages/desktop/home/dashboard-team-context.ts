import { StatboticsTeamEPAs } from "../../../lib/statbotics/teams";
import { createContext } from "react";

export const TeamDataContext = createContext<Record<string, StatboticsTeamEPAs>>({});
