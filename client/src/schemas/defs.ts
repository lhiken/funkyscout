// This file should not need to be changed when preparing the app for a new year.

// App related

import { Tables } from "../lib/supabase/database.types";
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

export type DisplayedMetric = {
   title: string;
   values: { teamKey: string; value: number }[];
   type: "bar" | "box" | "line" | "pie";
};

// Pit scouting data

// Pit Data
export interface PitData {
   robotHeightInches: number;
   robotWeightPounds: number;
   subjectiveRating: number;
   robotArchetype: string;
   robotRobustness: number;
   comment: string;
}

export interface PitData2025 extends PitData {
   canScoreReef: boolean[];
   canScoreNet: boolean;
   canScoreProcessor: boolean;
   canClimbDeep: boolean;
   canClimbShallow: boolean;
   canGroundAlgae: boolean;
   canGroundCoral: boolean;
   canSourceCoral: boolean;
   canReefAlgae: boolean;
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
   comment: string; // The comment, set by the scouting app
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

/** */
/** Data Parser
 * For each metric defined in schema.ts, there must exist a function
 * to get said metric.
 */
export type RequiredFunctions = {
   getMatchTotalPoints: (matchKey: string) => number;
   getMatchTeamPoints: (matchKey: string, teamKey: string) => {
      tele: number;
      auto: number;
   };
};

export class DataParser<T extends keyof (MatchMetrics | TeamMetrics)> {
   private data: Tables<"event_match_data">[] = [];
   private combinedData: {
      matchKey: string;
      teamKey: string;
      alliance: "red" | "blue";
      comment: string;
      metrics: MatchMetrics[T];
      autoActions: AutoAction<T>[];
      teleActions: TeleopAction<T>[];
   }[] = [];
   private teamKey: string;

   constructor(data: Tables<"event_match_data">[], teamKey?: string) {
      this.data = data;
      this.teamKey = teamKey || "";

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
            comment: combinedMetrics.comment,
            metrics: combinedMetrics.metrics,
            autoActions: combinedActions.autoActions,
            teleActions: combinedActions.teleopActions,
         });
      }
   }

   convertTeamKeyObjectToArray(array: Record<string, number[]>) {
      return Object.entries(array).flatMap((val) => ({
         teamKey: val[0],
         value: val[1],
      }));
   }

   convertValueArrayToMeanArray(array: { teamKey: string; value: number[] }[]) {
      return array.map((val) => ({
         teamKey: val.teamKey,
         value: val.value.reduce((a, b) => a + b) / val.value.length,
      }));
   }

   getTeamMetricRecord<
      T,
      Year extends keyof MatchMetrics,
   >(
      metricKey: keyof MatchMetrics[Year],
      teamKey?: string,
   ) {
      const data = this.getParserCombinedData().filter((val) =>
         teamKey ? val.teamKey == teamKey : true
      );
      const returnData: Record<string, T[]> = {};

      for (const entry of data) {
         const value = entry
            .metrics[metricKey as keyof typeof entry.metrics] as T;

         if (value) {
            returnData[entry.teamKey].push(
               value,
            );
         }
      }

      return returnData;
   }

   getMatchMetricRecord<
      T,
      Year extends keyof MatchMetrics,
   >(
      metricKey: keyof MatchMetrics[Year],
      matchKey: string,
      teamKey?: string,
   ) {
      const data = this.getParserCombinedData().filter((val) =>
         (teamKey ? val.teamKey == teamKey : true) && val.matchKey == matchKey
      );
      const returnData: Record<string, T> = {};

      for (const entry of data) {
         const value = entry
            .metrics[metricKey as keyof typeof entry.metrics] as T;

         if (value) {
            returnData[entry.teamKey] = value;
         }
      }

      return returnData;
   }

   getTeamComments(teamKey?: string) {
      const commentArray: {
         matchKey: string;
         comment: string;
      }[] = [];

      for (const entry of this.combinedData) {
         if (
            teamKey ? teamKey == entry.teamKey : this.teamKey == entry.teamKey
         ) {
            commentArray.push({
               matchKey: entry.matchKey,
               comment: entry.comment,
            });
         }
      }

      return commentArray;
   }

   getParserData() {
      return this.data;
   }

   getParserCombinedData() {
      return this.combinedData;
   }

   getParserTeam() {
      return this.teamKey;
   }
}
