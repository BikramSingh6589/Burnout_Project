import type {
  BurnoutHistoryItem,
  HistoricalAnalytics,
  TrendStatus,
  TrendSummary,
} from "../../types/burnout.types.js";

const SIGNIFICANCE_THRESHOLD = 3;

const averageScore = (items: BurnoutHistoryItem[]): number => {
  if (!items.length) {
    return 0;
  }

  const sum = items.reduce((acc, item) => acc + item.burnoutScore, 0);
  return Math.round(sum / items.length);
};

const getWindowRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(end.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const getItemsInRange = (items: BurnoutHistoryItem[], start: Date, end: Date): BurnoutHistoryItem[] =>
  items.filter((item) => item.completedAt >= start && item.completedAt <= end);

const deriveTrend = (currentAverage: number, previousAverage: number): TrendStatus => {
  if (currentAverage <= previousAverage - SIGNIFICANCE_THRESHOLD) {
    return "IMPROVING";
  }

  if (currentAverage >= previousAverage + SIGNIFICANCE_THRESHOLD) {
    return "WORSENING";
  }

  return "STABLE";
};

const analyzeWindow = (sortedHistory: BurnoutHistoryItem[], days: number): TrendStatus => {
  const { start, end } = getWindowRange(days);
  const currentWindow = getItemsInRange(sortedHistory, start, end);

  if (currentWindow.length === 0) {
    return "STABLE";
  }

  const previousStart = new Date(start);
  previousStart.setDate(start.getDate() - days);
  previousStart.setHours(0, 0, 0, 0);

  const previousEnd = new Date(start);
  previousEnd.setHours(0, 0, 0, 0);

  const previousWindow = getItemsInRange(sortedHistory, previousStart, previousEnd);

  if (previousWindow.length === 0) {
    return "STABLE";
  }

  const currentAverage = averageScore(currentWindow);
  const previousAverage = averageScore(previousWindow);

  return deriveTrend(currentAverage, previousAverage);
};

const getLatestTrend = (summary: TrendSummary): TrendStatus => {
  if (summary.last30Days !== "STABLE") {
    return summary.last30Days;
  }

  if (summary.last7Days !== "STABLE") {
    return summary.last7Days;
  }

  return summary.last90Days;
};

export const analyzeAssessmentTrends = (history: BurnoutHistoryItem[]): TrendSummary => {
  const sortedHistory = [...history].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());

  return {
    last7Days: analyzeWindow(sortedHistory, 7),
    last30Days: analyzeWindow(sortedHistory, 30),
    last90Days: analyzeWindow(sortedHistory, 90),
  };
};

export const summarizeHistoricalAnalytics = (
  history: BurnoutHistoryItem[],
  currentScore: number,
  baselineScore?: number,
): HistoricalAnalytics => {
  const sortedHistory = [...history].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  const assessmentCount = sortedHistory.length;

  const highestScore = assessmentCount ? Math.max(...sortedHistory.map((item) => item.burnoutScore)) : 0;
  const lowestScore = assessmentCount ? Math.min(...sortedHistory.map((item) => item.burnoutScore)) : 0;
  const averageScoreValue = assessmentCount ? averageScore(sortedHistory) : 0;
  const trendSummary = analyzeAssessmentTrends(sortedHistory);
  const currentTrend = getLatestTrend(trendSummary);

  return {
    averageScore: averageScoreValue,
    highestScore,
    lowestScore,
    assessmentCount,
    currentTrend,
    baselineDifference: baselineScore !== undefined ? Math.round(currentScore - baselineScore) : undefined,
  };
};
