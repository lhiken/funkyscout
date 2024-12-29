// This file should not need to be changed when preparing the app for a new year.

// App related

import {
   MatchMetrics,
   RobotActions,
   ScoreActions,
   TeamMetrics,
} from "./schema";

export type Picklist = {
   teamKey: string;
   comment?: string;
   excluded: boolean;
}[];

// Pit scouting data

// Pit Data
export interface PitData {
   robotHeightInches: number;
   robotWeightInches: number;
   subjectiveRating: number;
   selfConfidence: number;
   comment: string;
}

// Database-stored Data Types

/** Note
 * The data types defined in this file change based on the
 * types defined in schema.ts, so this file should not be
 * changed.
 */

/** Combined Match Metrics
 * Combined match metrics is the data type that the app stores
 * on the database as "data" and is used in the data parser.
 */
export type CombinedMatchMetrics<
   Year extends keyof MatchMetrics,
> = {
   gameYear: Year; // The year of the data
   epochTime: number; // The time, set by the scouting app
   metrics: MatchMetrics[Year]; // The metrics, based on schema.ts
};

/** Combined Match Actions
 * Combined match actions is the data type that the app stores
 * on the database as "data_raw" and is used in the data parser.
 */
export type CombinedMatchActions<
   Year extends keyof (ScoreActions | RobotActions),
> = {
   gameYear: Year; // The year of the data
   epochTime: number; // The time, set by the scsouting app
   teleopActions: TeleopAction<Year>[]; // An array of teleop actions
   autoActions: AutoAction<Year>[]; // An array of auto actions
};

/** Actions
 * Actions are the things the robot does during a match, like scoring
 * or climbing. Each "action" has a time, location, and action (as defined
 * in schema.ts).
 */
export type TeleopAction<Year extends keyof (ScoreActions | RobotActions)> = {
   timestamp: number; // Timestamp of the action
   location?: { x: number; y: number }; // Position on the field, can be arbitrary year-to-year.
   action: RobotActions[Year] | ScoreActions[Year]; // The action taken by the robot.
};

export type AutoAction<Year extends keyof (ScoreActions | RobotActions)> = {
   timestamp: number; // Timestamp of the action
   location?: { x: number; y: number }; // Position on the field, can be arbitrary year-to-year.
   action: RobotActions[Year] | ScoreActions[Year]; // The action taken by the robot.
};

/** Metrics Object
 * The metrics object is an object with key-values of each metric
 * For example, it could be {piecesScored: number, piecesMissed: number}
 * It's based off of the list of possible metrics defined in schema.ts
 */

// Type logic

export type MetricDescriptionsType = {
   [K in keyof TeamMetrics]: {
      [Q in keyof TeamMetrics[K]]: {
         title: string;
         description?: string;
         queryHint?: keyof MatchMetrics[K];
      };
   };
};

export type PointValuesType = {
   [K in keyof ScoreActions]: {
      [Q in ScoreActions[K]]: number;
   };
};
