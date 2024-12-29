import { fetchTBAData } from "./fetch";

interface TeamRank {
   key: string;
   team: number;
   name: string;
   rank: number;
   record: {
      losses: number;
      ties: number;
      wins: number;
   };
   nextMatch: string | null;
   lastMatch: string | null;
   matches: number;
   orders: number[]; //This is the "sort_orders" from TBA's API
}

/* Fetchs teams from TBA and returns each team
 * and their ranks
 */
async function fetchTBAEventTeams(event: string) {
   const teamsStatuses = await fetchTBAData(
      `/event/${event}/teams/statuses`,
      "GET",
   );
   const teamsData = await fetchTBAData(
      `/event/${event}/teams`,
      "GET",
   );

   if (!teamsStatuses || !teamsData) {
      return;
   }

   const teams: TeamRank[] = [];

   if (teamsStatuses[teamsData[0].key] == null) {
      for (const team of teamsData) {
         teams.push({
            key: team.key,
            team: team.team_number,
            name: team.nickname,
            rank: 0,
            record: {
               losses: 0,
               ties: 0,
               wins: 0,
            },
            nextMatch: "",
            lastMatch: "",
            matches: 0,
            orders: [],
         });
      }

      return teams;
   }

   for (const team of teamsData) {
      const teamStatus = teamsStatuses[team.key];

      teams.push({
         key: team.key,
         team: team.team_number,
         name: team.nickname,
         rank: teamStatus.qual.ranking.rank,
         record: teamStatus.qual.ranking.record,
         nextMatch: teamStatus.next_match_key,
         lastMatch: teamStatus.last_match_key,
         matches: teamStatus.qual.ranking.matches_played,
         orders: teamStatus.qual.ranking.sort_orders,
      });
   }

   return teams;
}

interface EventSchedule {
   [match_key: string]: {
      redTeams: string[];
      blueTeams: string[];
      est_time: number;
   };
}

async function fetchTBAMatchSchedule(eventKey: string) {
   const matchStatus = await fetchTBAData(
      `/event/${eventKey}/matches/simple`,
      "GET",
   );

   if (!matchStatus || matchStatus.length == 0) {
      return;
   }

   const matchSchedule: EventSchedule = {};

   for (const team of matchStatus) {
      matchSchedule[team.key] = {
         redTeams: [
            team.alliances.red.team_keys[0],
            team.alliances.red.team_keys[1],
            team.alliances.red.team_keys[2],
         ],
         blueTeams: [
            team.alliances.blue.team_keys[0],
            team.alliances.blue.team_keys[1],
            team.alliances.blue.team_keys[2],
         ],
         est_time: team.predicted_time,
      };
   }

   return matchSchedule;
}

async function fetchTeamEventCOPRs(
   eventKey: string,
) {
   const OPRs = await fetchTBAData(
      `/event/${eventKey}/oprs`,
      "GET",
   );

   const COPRs = await fetchTBAData(
      `/event/${eventKey}/coprs`,
      "GET",
   );

   if (!OPRs || !COPRs) return;

   const returnObject: Record<string, Record<string, number>> = {};

   returnObject["Total Points"] = OPRs.oprs;

   for (const value in COPRs) {
      console.log(value);
      returnObject[value] = COPRs[value];
   }

   console.log(returnObject);

   return returnObject;
}

export { fetchTBAEventTeams, fetchTBAMatchSchedule, fetchTeamEventCOPRs };
export type { EventSchedule, TeamRank };
