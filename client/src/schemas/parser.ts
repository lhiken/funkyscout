import { DataParser, RequiredFunctions } from "./defs";

/** Data Parser Implementation
 * 1. There must be a "getTeam..." function for each
 * team metric where either a teamKey can be passed in.
 * If there is no teamKey, return the value for all teams.
 */

/** Example Parser
 * All functions required are implememented with the correct
 * formats.
 */
export class DataParser2024 extends DataParser<2024>
   implements RequiredFunctions<2024> {
   getTeamNotesScored(teamKey?: string) {
      console.log(teamKey);
      return { teamKey: [0] };
   }
   getTeamNotesMissed(teamKey?: string) {
      console.log(teamKey);
      return { teamKey: [0] };
   }
   getTeamRobotDisabled(teamKey?: string) {
      console.log(teamKey);
      return { teamKey: [false] };
   }
   getMatchNotesScored(matchKey: string) {
      console.log(matchKey);
      return { frc254: 0 };
   }
   getMatchNotesMissed(matchKey: string) {
      console.log(matchKey);
      return { frc254: 0 };
   }
   getMatchRobotClimb(matchKey: string) {
      console.log(matchKey);
      return { frc254: true };
   }
}
