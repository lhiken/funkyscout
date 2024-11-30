import { fetchStatboticsData } from "./fetch";

interface StatboticsTeamData {
   team: string;
   name: string;
   country: string;
   state: string;
   district: string | null;
   rookie_year: number;
   offseason: boolean;
   active: boolean;
   record: {
      season: {
         wins: number;
         losses: number;
         ties: number;
         count: number;
         winrate: number;
      };
      full: {
         wins: number;
         losses: number;
         ties: number;
         count: number;
         winrate: number;
      };
   };
   norm_epa: {
      current: number;
      recent: number;
      mean: number;
      max: number;
   };
}

interface StatboticsTeamEPAs {
   team: string,
   year: number,
   name: string,
   country: string,
   state: string,
   district: string | null,
   offseason: boolean,
   epa: {
      total_points: {
         mean: number,
         sd: number,
      }
      unitless: number,
      norm: number,
      conf: number[]
   },
   record: {
      season: {
         wins: number;
         losses: number;
         ties: number;
         count: number;
         winrate: number;
      };
      full: {
         wins: number;
         losses: number;
         ties: number;
         count: number;
         winrate: number;
      };
   };
}

async function fetchStatboticsTeamData(team: string) {
   const teamData: StatboticsTeamData = await fetchStatboticsData(
      `/team/${team}`,
   );

   if (!teamData) {
      return false;
   }

   return teamData;
}

async function fetchStatboticsTeamEPA(team: string, event: string) {
   const teamData: StatboticsTeamEPAs = await fetchStatboticsData(
      `/team_year/${team}/${event.substring(0, 4)}`,
   );

   if (!teamData) {
      return false;
   }

   return teamData;
}

export { fetchStatboticsTeamData, fetchStatboticsTeamEPA };
export type { StatboticsTeamData, StatboticsTeamEPAs };
