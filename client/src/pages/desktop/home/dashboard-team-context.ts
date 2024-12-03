import { StatboticsTeamEPAs } from "../../../lib/statbotics/teams";
import { createContext } from "react";

export const TeamDataProgressContext = createContext<{
   fetched: number;
   total: number;
   errors: number;
   fetchTime: number;
}>({
   fetched: 0,
   total: 0,
   errors: 0,
   fetchTime: -1,
});
export const TeamDataContext = createContext<
   Record<string, StatboticsTeamEPAs>
>({});
