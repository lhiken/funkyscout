import { MetricDescriptionsType, PointValuesType } from "./defs";

/** Yearly update guide
 * This file acts as a "config" for the app,
 *
 * To add a new year, create years with actions in
 * each of the types and definitions in this file
 * before updating any other code.
 *
 * Add a new year for each of the following types and
 * syntax errors will show where things must be changed.
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
      | "noteMiss";
   2025:
      | "exampleDisable"
      | "exampleExplode";
};

/** Scoring actions
 * These actions contribute directly to earning
 * points during a match and should be redefined
 * every year.
 */
export type ScoreActions = {
   2024:
      | "noteScore"
      | "robotClimb";
   2025:
      | "exampleScore"
      | "exampleClimb";
};

/** Scoring action points
 * These values provide a point value for each value.
 * While not perfectly accurate, this should be able
 * to give a rough estimate of the points scored.
 */
export const PointValues: PointValuesType = {
   2024: {
      // Note: these are random values
      noteScore: 2,
      robotClimb: 2,
   },
   2025: {
      exampleScore: 0,
      exampleClimb: 0,
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
 */

/** Match Metrics
 * Match metrics are collected on a per-team-per-match basis,
 * as its all the user can collect during the match when each
 * scouter looks at one team.
 */
export type MatchMetrics = {
   2024: {
      notesScored: number;
      notesMissed: number;
      robotClimb: boolean;
   };
   2025: {
      exampleMetric: number;
   };
};

/** Team Metrics
 * Team metrics are metrics for an entire team during the event,
 * like game pieces scored on average. Unlike the other types,
 * this is defined to be used in the data parser and be displayed
 * in the app rather than be stored in the database.
 */
export type TeamMetrics = {
   2024: {
      notesScored: number[];
      notesMissed: number[];
      robotDisabled: boolean[];
   };
   2025: {
      exampleMetric: number[];
   };
};

/** Metric Descriptions
 * The metric descriptions are used to tell the app how to display
 * and process the data for a certain team.
 */
export const MetricDescriptions: MetricDescriptionsType = {
   2024: {
      notesScored: {
         title: "Notes Scored",
      },
      notesMissed: {
         title: "Notes Missed",
      },
      robotDisabled: {
         title: "Robot Disabled",
      },
   },
   2025: {
      exampleMetric: {
         title: "Example metric",
      },
   },
};
