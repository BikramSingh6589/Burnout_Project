import type { RiskLevel } from "./common.types.js";

export interface BurnoutScoreBreakdown {
  stress: number;
  sleep: number;
  motivation: number;
  energy: number;
  backlog: number;
  procrastination: number;
  screenTime: number;
  academicSatisfaction: number;
  studyHours: number;
}

export interface BurnoutScoreResult {
  burnoutScore: number;
  burnoutScoreBreakdown: BurnoutScoreBreakdown;
}

export interface BaselineRecord {
  baselineScore: number;
  baselineDate: Date;
  baselineRisk: RiskLevel;
}

export interface BaselineComparisonResult {
  baselineScore: number;
  currentScore: number;
  difference: number;
  status: "IMPROVED" | "STABLE" | "WORSENED";
}

export interface BurnoutHistoryItem {
  burnoutScore: number;
  completedAt: Date;
}

export type TrendStatus = "IMPROVING" | "STABLE" | "WORSENING";

export interface TrendSummary {
  last7Days: TrendStatus;
  last30Days: TrendStatus;
  last90Days: TrendStatus;
}

export interface HistoricalAnalytics {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  assessmentCount: number;
  currentTrend: TrendStatus;
  baselineDifference?: number;
}
