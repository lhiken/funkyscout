import { Tables } from "../lib/supabase/database.types";
import { CombinedMatchActions, CombinedMatchMetrics } from "./defs";
import { MatchMetrics, TeamMetrics } from "./schema";

/** Data Parser
 * For each metric defined in schema.ts, there must exist a function
 * to get said metric.
 */
type RequiredFunctions<T extends keyof TeamMetrics> =
   & TeamFunctions<T>
   & MatchFunctions<T>;

type TeamFunctions<T extends keyof TeamMetrics> = {
   [K in keyof TeamMetrics[T] as `getTeam${Capitalize<string & K>}`]: (
      teamKey?: string,
   ) => CommonTeamMetricReturnType<TeamMetrics[T][K]>;
};

type MatchFunctions<T extends keyof MatchMetrics> = {
   [Q in keyof MatchMetrics[T] as `getMatch${Capitalize<string & Q>}`]: (
      matchKey: string,
   ) => CommonMatchMetricReturnType<MatchMetrics[T][Q]>;
};

type CommonTeamMetricReturnType<T> = T;

type CommonMatchMetricReturnType<T> = Record<string, T>;

class DataParser<T extends keyof (MatchMetrics | TeamMetrics)> {
   private data: Tables<"event_match_data">[] = [];
   private combinedData: {
      matchKey: string;
      teamKey: string;
      alliance: "red" | "blue";
      metrics: CombinedMatchMetrics<T>;
      actions: CombinedMatchActions<T>;
   }[] = [];
   private team: string;

   constructor(data: Tables<"event_match_data">[], teamKey?: string) {
      this.data = data;
      this.team = teamKey || "";

      if (teamKey) {
         this.data = data.filter((val) => val.team == teamKey);
      }

      for (const entry of data) {
         const combinedMetrics = entry.data as CombinedMatchMetrics<T>;
         const combinedActions = entry.data_raw as CombinedMatchActions<T>;

         this.combinedData.push({
            matchKey: entry.match,
            teamKey: entry.team,
            alliance: entry.alliance,
            metrics: combinedMetrics,
            actions: combinedActions,
         });
      }
   }

   getParserData() {
      return this.data;
   }

   getParserTeam() {
      return this.team;
   }
}

/** Data Parser Implementation
 * 1. There must be a "getTeam..." function for each
 * team metric where either a teamKey can be passed in,
 * or if it isn't,
 */

export class DataParser2024 extends DataParser<2024>
   implements RequiredFunctions<2024> {
   getTeamNotesScored(teamKey?: string) {
      console.log(teamKey);
      return [];
   }
   getTeamNotesMissed(teamKey?: string) {
      console.log(teamKey);
      return [];
   }
   getTeamRobotDisabled(teamKey?: string) {
      console.log(teamKey);
      return [];
   }
   getMatchNotesScored(matchKey: string) {
      console.log(matchKey);
      return {};
   }
   getMatchNotesMissed(matchKey: string) {
      console.log(matchKey);
      return {};
   }
   getMatchRobotClimb(matchKey: string) {
      console.log(matchKey);
      return {};
   }
}
