import type { NextFunction, Request, Response } from "express";
import { getDashboardAnalytics } from "../services/analytics/dashboard.service.js";
import type { RecommendationWithFeedback } from "../services/recommendation/recommendation.types.js";

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
    const analytics = await getDashboardAnalytics(userId);

    const formattedRecommendations = (analytics.recommendations || []).map((recommendation: RecommendationWithFeedback) => ({
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
    }));

    res.status(200).json({
      success: true,
      data: {
        ...analytics,
        recommendations: formattedRecommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};
