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
      return 0;
   }
}

export class DataParser2025 extends DataParser<2025>
   implements RequiredFunctions {
   getMatchTotalPoints(matchKey: string) {
      console.log(matchKey);

      /* TODO */

      return 0;
   }

   getMatchTeamPoints(matchKey: string, teamKey: string) {
      console.log(matchKey + teamKey);

      /* TODO */

      return 0;
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
