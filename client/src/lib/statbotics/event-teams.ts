import {
   fetchStatboticsTeamEPA,
   StatboticsTeamEPAs,
} from "./teams";
import { fetchTeamsByEvent } from "../supabase/data";
import { handleError } from "../../utils/errorHandler";

/* Returns the statbotics data of each team but returns
 * cached data if last fetch was too recent to prevent
 * spamming Statbotics' servers.
 */
async function fetchEventTeamEPAs(
   event: string,
   onProgress?: (fetched: number, total: number, errors: number) => void,
): Promise<Record<string, StatboticsTeamEPAs>> {
   const data = localStorage.getItem("statboticsTeamData");
   const fetchEvent = localStorage.getItem("statboticsTeamDataFetchEvent");
   const fetchTime = Number(
      localStorage.getItem("statboticsTeamDataFetchTime"),
   );

   const invalidateMiliseconds = 120000;

   const cachedData: Record<string, StatboticsTeamEPAs> = data
      ? JSON.parse(data)
      : {};

   if (fetchEvent == event && cachedData) {
      console.log("Fetch team EPAs: Returned cached data");
      if (Date.now() - fetchTime >= invalidateMiliseconds) {
         fetchNewData(event, onProgress);
      }
      return cachedData;
   }

   return fetchNewData(event, onProgress);
}


/* This is a helper function to allow for background data fetching
 * by the fetchEventTeamEPAs function
 */
async function fetchNewData(
   event: string,
   onProgress?: (fetched: number, total: number, errors: number) => void,
) {
   try {
      const teams = await fetchTeamsByEvent(event);

      if (!teams || teams.length === 0) {
         console.warn("Fetch team EPAs: No teams found for event");
         throw new Error("No teams found for the event");
      }

      const teamEPAs: Record<string, StatboticsTeamEPAs> = {};
      let fetchedCount = 0;
      let errorCount = 0;

      const teamDataPromises = teams.map(async (team) => {
         try {
            const teamStatboticsData = await fetchStatboticsTeamEPA(
               team.team.substring(3),
               event,
            );

            if (teamStatboticsData) {
               teamEPAs[team.team] = teamStatboticsData;
            } else {
               errorCount++;
            }
         } catch (error) {
            console.error(
               `Failed to fetch data for team ${team.team}:`,
               error,
            );
         } finally {
            fetchedCount++;
            if (onProgress) onProgress(fetchedCount, teams.length, errorCount);
         }
      });

      await Promise.all(teamDataPromises);

      localStorage.setItem("statboticsTeamData", JSON.stringify(teamEPAs));
      localStorage.setItem(
         "statboticsTeamDataFetchTime",
         Date.now().toString(),
      );
      localStorage.setItem("statboticsTeamDataFetchEvent", event);

      console.log("Fetch team EPAs: Refreshed data and updated cache");
      return teamEPAs;
   } catch (error) {
      handleError(error);
      throw new Error("Failed to fetch team EPAs");
   }
}

export { fetchEventTeamEPAs };
