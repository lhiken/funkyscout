import { AutoMetricsObject, PointValues, TeleopMetricsObject } from "./defs";

/** Yearly update guide
 * This file acts as a "config" for the app,
 *
 * To add a new year, create years with actions in
 * each of the types and definitions in this file
 * before updating any other code.
 */

/** Actions
 * These are the values that are stored as "raw data"
 * in the database and is what the app will be taking
 * note of during scouting
 *
 * 2024 is used as an example.
 */

/** Robot actions
 * These actions are things the robot can do but
 * don't contribute to earning points during a match
 */
export type RobotActions = {
   2024:
      | "notePickup"
      | "noteDrop"
      | "noteMiss"
      | "breakdown"
      | "brownout"
      | "tipover"
      | "defended";
   // 2025:
   //    | "robot action"
};

/** Scoring actions
 * These actions contribute directly to earning
 * points during a match and should be redefined
 * every year.
 */
export type ScoringActions = {
   2024:
      | "noteScoreAmp"
      | "noteScoreSpeaker"
      | "robotTrap"
      | "climb";
   // 2025:
   //    | "scorable action"
};

/** Scoring action points
 * These values provide a point value for each value.
 * While not perfectly accurate, this should be able
 * to give a rough estimate of the points scored.
 */
export const YearlyPointValues: PointValues = {
   2024: {
      // Note: these are random values
      noteScoreAmp: 1,
      noteScoreSpeaker: 2,
      robotTrap: 2,
      climb: 2,
   },
};

/** Metrics
 * These are the values that are stored as "processed data"
 * or just "data" in the database
 *
 * These metrics exist for each team in a match and are
 * used to compare teams. Each metric then must be defined
 * with a title and then queryKey that matches one of the
 * robot/scoring actions.
 *
 * While meaningless on its own, the queryKey serves as a
 * "hint" that you can use in your code as to what the data
 * actually is.
 */
export type TeleopMetrics = {
   2024:
      | "notesScoredAmp"
      | "notesScoredSpeaker"
      | "failureTime";
};

export const TeleopMetricsTable: TeleopMetricsObject = {
   2024: {
      notesScoredAmp: {
         title: "Amp Notes",
         queryKey: "noteScoreAmp",
      },
      notesScoredSpeaker: {
         title: "Speaker Notes",
         queryKey: "noteScoreSpeaker",
      },
      failureTime: {
         title: "Failure Time",
         queryKey: "breakdown",
      },
   },
};

export type AutoMetrics = {
   2024:
      | "notesScored"
      | "notesTrapped";
};

export const AutoMetricsTable: AutoMetricsObject = {
   2024: {
      notesScored: {
         title: "Amp Notes",
         queryKey: "noteScoreAmp",
      },
      notesTrapped: {
         title: "Trapped Notes",
         queryKey: "robotTrap",
      },
   },
};
