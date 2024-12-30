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
   implements RequiredFunctions<2024> {
   private genRandomValuesArray(len: number) {
      const newArray: number[] = [];
      for (let i = 0; i < len; i++) {
         newArray.push(parseFloat((Math.random() * 10).toFixed(2)));
      }
      return newArray;
   }

   getTeamNotesScored(teamKey?: string) {
      console.log(teamKey);
      return { frc254: this.genRandomValuesArray(9) };
   }
   getTeamNotesMissed(teamKey?: string) {
      console.log(teamKey);
      return { frc254: this.genRandomValuesArray(9) };
   }
   getTeamRobotDisabled(teamKey?: string) {
      console.log(teamKey);
      return { frc254: this.genRandomValuesArray(9).map((val) => val > 4.5) };
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
