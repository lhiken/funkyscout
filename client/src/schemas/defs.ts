// This file should not need to be changed when preparing the app for a new year.

// App related

import {
   AutoMetrics,
   RobotActions,
   ScoringActions,
   TeleopMetrics,
} from "./schema";

export type Picklist = {
   teamKey: string;
   comment?: string;
   excluded: boolean;
}[];

// Pit scouting data

// Pit Data
export interface PitScoutingData {
   robotHeightInches: number;
   robotWeightInches: number;
   subjectiveRating: number;
   selfConfidence: number;
   comment: string;
}

// Auto Data
export interface RawAutoAction<
   T extends keyof (RobotActions | ScoringActions),
> {
   position: { x: number; y: number };
   epochTimestamp: number;
   action: RobotActions[T] | ScoringActions[T];
}

export interface RawMatchAutoData<
   T extends keyof ScoringActions | keyof RobotActions,
> {
   year: T;
   startingPosition: { x: number; y: number };
   actions: RawAutoAction<T>[];
}

export interface ProcessedAutoData<
   T extends keyof ScoringActions | keyof RobotActions,
> {
   year: T;
   startingPosition: { x: number; y: number };
   metrics: AutoStoredMetrics<T>;
}

//Match Data
export interface RawMatchAction<
   T extends keyof (RobotActions | ScoringActions),
> {
   position: { x: number; y: number };
   epochTimestamp: number;
   action: RobotActions[T] | ScoringActions[T];
}

export interface RawMatchData<T extends keyof (RobotActions | ScoringActions)> {
   year: T;
   actions: RawMatchAction<T>[];
}

export interface ProcessedMatchData<
   T extends keyof (RobotActions | ScoringActions),
> {
   year: T;
   metrics: TeleopStoredMetrics<T>;
}

// Type logic
export type ScoringPointValue<T extends keyof ScoringActions> = {
   [K in ScoringActions[T]]: number;
};

export type MetricDetail<T extends keyof (RobotActions | ScoringActions)> = {
   title: string;
   queryKey?: RobotActions[T] | ScoringActions[T];
};

export type PointValues = Record<
   keyof ScoringActions,
   ScoringPointValue<keyof ScoringActions>
>;

export type TeleopMetricsObject = Record<
   keyof TeleopMetrics,
   Record<TeleopMetrics[keyof TeleopMetrics], MetricDetail<keyof TeleopMetrics>>
>;

export type AutoMetricsObject = Record<
   keyof AutoMetrics,
   Record<AutoMetrics[keyof AutoMetrics], MetricDetail<keyof AutoMetrics>>
>;

export type AutoStoredMetrics<T extends keyof (RobotActions | ScoringActions)> =
   Record<
      AutoMetrics[T],
      number | boolean | string
   >;

export type TeleopStoredMetrics<
   T extends keyof (RobotActions | ScoringActions),
> = Record<
   TeleopMetrics[T],
   number | boolean | string
>;
