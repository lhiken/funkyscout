import {
   fetchStatboticsTeamEPA,
   StatboticsTeamEPAs,
} from "../../lib/statbotics/teams";
import { fetchTeamsByEvent } from "../../lib/supabase/data";
import { handleError } from "../errorHandler";

/* Returns the statbotics data of each team but returns
 * cached data if last fetch was too recent to prevent
 * spamming Statbotics' servers.
 */
async function fetchEventTeamEPAs(event: string) {
   const data = localStorage.getItem("statboticsTeamData");
   const fetchTime = Number(localStorage.getItem("statboticsTeamDataFetchTime"));

   // 60000 is the miliseconds before each new fetch is allowed
   if (Date.now() - fetchTime < 60000 && data) {
      const parsedData: Record<string, StatboticsTeamEPAs> = JSON.parse(data);
      console.log("Fetch team EPAs: Returned cached data");
      return parsedData;
   }

   try {
      const teams = await fetchTeamsByEvent(event);

      if (!teams || teams.length === 0) {
         return false;
      }

      const teamEPAs: Record<string, StatboticsTeamEPAs> = {};

      const teamDataPromises = teams.map(async (team) => {
         const teamStatboticsData = await fetchStatboticsTeamEPA(
            team.team.substring(3), event
         );

         if (teamStatboticsData) {
            teamEPAs[team.team] = teamStatboticsData;
         }
      });

      await Promise.all(teamDataPromises);

      localStorage.setItem("statboticsTeamData", JSON.stringify(teamEPAs));
      localStorage.setItem("statboticsTeamDataFetchTime", Date.now().toString());

      console.log("Fetch team EPAs: Returned fresh data");
      return teamEPAs;
   } catch (error) {
      handleError(error);
      return false;
   }
}

export { fetchEventTeamEPAs };
