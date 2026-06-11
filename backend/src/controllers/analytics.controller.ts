import type { NextFunction, Request, Response } from "express";
import { getAssessmentHistory } from "../services/assessment/assessment.service.js";
import { getWeeklyAssessmentHistory } from "../services/assessment/weekly-assessment.service.js";
import { summarizeHistoricalAnalytics } from "../services/burnout/trend-analysis.service.js";
import { Student } from "../models/Student.js";
import type { BurnoutHistoryItem } from "../types/burnout.types.js";
import { getDashboardRecommendations } from "../services/recommendation/recommendation.service.js";
import type { RecommendationWithFeedback } from "../services/recommendation/recommendation.types.js";

const formatRecommendationResponse = (recommendation: RecommendationWithFeedback) => ({
  id: recommendation.id,
  assessmentId: recommendation.assessmentId,
  category: recommendation.category,
  priority: recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1),
  title: recommendation.title,
  reason: recommendation.message,
  message: recommendation.message,
  followedStatus: recommendation.followedStatus,
  rating: recommendation.rating,
  feedbackText: recommendation.feedbackText,
  dateGenerated: recommendation.dateGenerated,
  createdAt: recommendation.createdAt,
});

export const getAnalyticsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userId = req.user.userId.toString();
    const student = await Student.findById(userId);
    if (!student) {
      res.status(404).json({ success: false, message: "Student profile not found" });
      return;
    }

    // Fetch both initial and weekly assessment history
    const initialHistory = await getAssessmentHistory(userId);
    const weeklyHistory = await getWeeklyAssessmentHistory(userId);

    // Map both to BurnoutHistoryItem format and combine
    const initialHistoryItems: BurnoutHistoryItem[] = initialHistory.map((item) => ({
      burnoutScore: item.burnoutScore,
      completedAt: item.completedAt ?? item.createdAt,
    }));

    const weeklyHistoryItems: BurnoutHistoryItem[] = weeklyHistory.map((item) => ({
      burnoutScore: item.burnoutScore,
      completedAt: item.completedAt ?? item.createdAt,
    }));

    const combinedHistory = [...initialHistoryItems, ...weeklyHistoryItems];

    const baselineRecord = student.baselineBurnoutScore !== undefined && student.baselineDate && student.baselineRiskLevel
      ? {
          baselineScore: student.baselineBurnoutScore,
          baselineDate: student.baselineDate,
          baselineRisk: student.baselineRiskLevel,
        }
      : undefined;

    const summary = summarizeHistoricalAnalytics(
      combinedHistory,
      student.currentBurnoutScore ?? 0,
      baselineRecord
    );

    const recommendations = await getDashboardRecommendations(userId).catch(() => []);

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        recommendations: recommendations.map(formatRecommendationResponse),
      },
    });
  } catch (error) {
    next(error);
  }
};
