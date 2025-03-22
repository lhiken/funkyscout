import { DataParser, RequiredFunctions } from "./defs";

/** yearly rewrite required
 * Create a new data parser function, implementation details
 * are below
 */

/** Data Parser Implementation
 * 1. There must be a "getTeam..." function for each
 * team metric where either a teamKey can be passed in.
 * If there is no teamKey, return the value for all teams.
 * 2. There must be a "getMatch..." function for each
 * team metric where a matchKey must be passed in, each team
 * getting a random value.
 */

/** Example Parser
 * All functions required are implememented with the correct
 * formats.
 */
export class DataParser2024 extends DataParser<2024>
   implements RequiredFunctions {
   getMatchTotalPoints(matchKey: string) {
      console.log(matchKey);
      return 0;
   }

   getMatchTeamPoints(matchKey: string, teamKey: string) {
      console.log(matchKey + teamKey);
      return {
         auto: 0,
         tele: 0,
      };
   }
}

export class DataParser2025 extends DataParser<2025>
   implements RequiredFunctions {
   getMatchTotalPoints(matchKey: string) {
      console.log(matchKey);

      /* TODO */

      return 0;
   }

   getTotalTeamPoints(teamKey: string) {
      const matchKeys = this.getParserCombinedData()
         .filter((val) => val.teamKey == teamKey)
         .map((val) => val.matchKey);

      const vals = matchKeys.map((val) =>
         this.getMatchTeamPoints(val, teamKey)
      );

      // Calculate the averages for 'auto' and 'tele'
      const autoAvg = vals.reduce((acc, { auto }) => acc + auto, 0) /
         vals.length;
      const teleAvg = vals.reduce((acc, { tele }) => acc + tele, 0) /
         vals.length;

      return { auto: autoAvg, tele: teleAvg };
   }

   getMatchTeamPoints(matchKey: string, teamKey: string) {
      const fullData = this.getParserCombinedData();
      const teamData = fullData.find((val) =>
         val.matchKey == matchKey && val.teamKey == teamKey
      );

      const autoL1 =
         teamData?.autoActions.filter((val) => val.action == "scoreL1")
            .length || 0;
      const autoL2 =
         teamData?.autoActions.filter((val) => val.action == "scoreL2")
            .length || 0;
      const autoL3 =
         teamData?.autoActions.filter((val) => val.action == "scoreL3")
            .length || 0;
      const autoL4 =
         teamData?.autoActions.filter((val) => val.action == "scoreL4")
            .length || 0;
      const autoNet =
         teamData?.autoActions.filter((val) => val.action == "scoreNet")
            .length || 0;
      const autoProc =
         teamData?.autoActions.filter((val) => val.action == "scoreProcessor")
            .length || 0;

      const teleL1 =
         teamData?.teleActions.filter((val) => val.action == "scoreL1")
            .length || 0;
      const teleL2 =
         teamData?.teleActions.filter((val) => val.action == "scoreL2")
            .length || 0;
      const teleL3 =
         teamData?.teleActions.filter((val) => val.action == "scoreL3")
            .length || 0;
      const teleL4 =
         teamData?.teleActions.filter((val) => val.action == "scoreL4")
            .length || 0;
      const teleNet =
         teamData?.teleActions.filter((val) => val.action == "scoreNet")
            .length || 0;
      const teleProc =
         teamData?.teleActions.filter((val) => val.action == "scoreProcessor")
            .length || 0;

      return {
         tele: teleL1 * 2 + teleL2 * 3 + teleL3 * 4 + teleL4 * 5 +
            teleProc * 2 + teleNet * 4 +
            (teamData?.metrics.climbShallow ? 6 : 0) +
            (teamData?.metrics.climbDeep ? 12 : 0),
         auto: autoL1 * 3 + autoL2 * 4 + autoL3 * 6 + autoL4 * 7 + autoNet * 4 +
            autoProc * 2,
      };
   }

   /* Might delete later?
    * Each thing is just getTeamMetric + key so maybe its not really necessary!
    */

   getTeamL1Scored(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("L1Scored", teamKey);
   }

   getTeamL2Scored(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("L2Scored", teamKey);
   }

   getTeamL3Scored(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("L3Scored", teamKey);
   }

   getTeamL4Scored(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("L4Scored", teamKey);
   }

   getTeamNetScored(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("netScored", teamKey);
   }

   getTeamProcessorScored(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("processorScored", teamKey);
   }

   getTeamTotalCoral(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("totalCoral", teamKey);
   }

   getTeamTotalAlgae(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("totalCoral", teamKey);
   }

   getTeamClimbTime(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("climbTime", teamKey);
   }

   getTeamClimbDeep(teamKey?: string) {
      return this.getTeamMetricRecord<boolean, 2025>("climbDeep", teamKey);
   }

   getTeamClimbShallow(teamKey?: string) {
      return this.getTeamMetricRecord<boolean, 2025>("climbShallow", teamKey);
   }

   getTeamDefenseScore(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("defenseScore", teamKey);
   }

   getTeamDrivingScore(teamKey?: string) {
      return this.getTeamMetricRecord<number, 2025>("drivingScore", teamKey);
   }
}

export function average(val: Record<string, number[]>): number {
   const values = Object.values(val).flat(1);
   return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}
