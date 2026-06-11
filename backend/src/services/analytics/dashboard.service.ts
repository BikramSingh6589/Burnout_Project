import { Types } from "mongoose";
import { Student } from "../../models/Student.js";
import { Journal } from "../../models/Journal.js";
import { getAssessmentHistory } from "../assessment/assessment.service.js";
import { getWeeklyAssessmentHistory } from "../assessment/weekly-assessment.service.js";
import { summarizeHistoricalAnalytics } from "../burnout/trend-analysis.service.js";
import { getDashboardRecommendations } from "../recommendation/recommendation.service.js";
import type { BurnoutHistoryItem } from "../../types/burnout.types.js";
import type { RecommendationWithFeedback } from "../recommendation/recommendation.types.js";

/**
 * Calculate the average sleep hours across all assessments
 */
const calculateSleepAverage = (assessments: any[]): number => {
  if (assessments.length === 0) {
    return 0;
  }

  const totalSleep = assessments.reduce((sum, assessment) => {
    return sum + (assessment.sleepHours || assessment.sleepHoursAverage || 0);
  }, 0);

  const average = totalSleep / assessments.length;
  return Math.round(average * 10) / 10;
};

/**
 * Calculate mood trend based on recent journal sentiment
 */
const calculateMoodTrend = async (userId: string): Promise<"Positive" | "Neutral" | "Negative"> => {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 7); // Last 7 days

  const recentEntries = await Journal.find({
    studentId: new Types.ObjectId(userId),
    createdAt: { $gte: windowStart },
  })
    .select({ sentiment: 1 })
    .lean();

  if (recentEntries.length === 0) {
    return "Neutral";
  }

  const sentimentCount = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  recentEntries.forEach((entry: any) => {
    const sentiment = entry.sentiment as "positive" | "negative" | "neutral";
    sentimentCount[sentiment]++;
  });

  const total = recentEntries.length;
  const negativeRatio = sentimentCount.negative / total;
  const positiveRatio = sentimentCount.positive / total;

  // Determine trend: majority rule
  if (negativeRatio > 0.5) {
    return "Negative";
  } else if (positiveRatio > 0.5) {
    return "Positive";
  }

  return "Neutral";
};

/**
 * Get complete dashboard analytics aggregated from all sources
 */
export const getDashboardAnalytics = async (userId: string) => {
  // Fetch student record for current scores and baseline
  const student = await Student.findById(userId);
  if (!student) {
    throw new Error("Student profile not found");
  }

  // Fetch both initial and weekly assessment history
  const initialHistory = await getAssessmentHistory(userId);
  const weeklyHistory = await getWeeklyAssessmentHistory(userId);

  // Combine all assessments
  const allAssessments = [...initialHistory, ...weeklyHistory];

  // Calculate sleep average across all assessments
  const sleepAverage = calculateSleepAverage(allAssessments);

  // Calculate mood trend from journal sentiment
  const moodTrend = await calculateMoodTrend(userId);

  // Map assessments to BurnoutHistoryItem for trend analysis
  const burnoutHistory: BurnoutHistoryItem[] = allAssessments.map((item) => ({
    burnoutScore: item.burnoutScore,
    completedAt: item.completedAt ?? item.createdAt,
  }));

  // Prepare baseline record if exists
  const baselineRecord =
    student.baselineBurnoutScore !== undefined && student.baselineDate && student.baselineRiskLevel
      ? {
          baselineScore: student.baselineBurnoutScore,
          baselineDate: student.baselineDate,
          baselineRisk: student.baselineRiskLevel,
        }
      : undefined;

  // Get historical analytics summary (trend analysis, averages, etc.)
  const summary = summarizeHistoricalAnalytics(
    burnoutHistory,
    student.currentBurnoutScore ?? 0,
    baselineRecord
  );

  // Get dashboard recommendations (top 3)
  const recommendations = await getDashboardRecommendations(userId).catch(() => []);

  // Return consolidated dashboard response
  return {
    ...summary,
    burnoutScore: student.currentBurnoutScore ?? 0,
    riskLevel: student.currentRiskLevel,
    sleepAverage,
    moodTrend,
    recommendations,
  };
};
