import type { NextFunction, Request, Response } from "express";
import {
  getLatestRecommendations,
  getRecommendationHistory,
  recordRecommendationFeedback,
  getPendingAiRecommendations,
  approveRecommendation,
  editAndApproveRecommendation,
  rejectRecommendation,
  deleteRecommendation,
} from "../services/recommendation/recommendation.service.js";
import type { RecommendationWithFeedback } from "../services/recommendation/recommendation.types.js";

const formatRecommendationResponse = (recommendation: RecommendationWithFeedback) => ({
  id: recommendation.id,
  assessmentId: recommendation.assessmentId,
  category: recommendation.category,
  priority: recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1),
  title: recommendation.title,
  reason: recommendation.message,
  message: recommendation.message,
  source: recommendation.source ?? "rules",
  followedStatus: recommendation.followedStatus,
  rating: recommendation.rating,
  feedbackText: recommendation.feedbackText,
  dateGenerated: recommendation.dateGenerated,
  createdAt: recommendation.createdAt,
});

export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const recommendations = await getLatestRecommendations(req.user.userId.toString());

    res.status(200).json({
      success: true,
      data: recommendations.map(formatRecommendationResponse),
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendationHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const history = await getRecommendationHistory(req.user.userId.toString());

    res.status(200).json({
      success: true,
      data: history.map(formatRecommendationResponse),
    });
  } catch (error) {
    next(error);
  }
};

export const submitRecommendationFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params;
    const { status, rating, feedbackText } = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: "Invalid recommendation ID" });
      return;
    }

    await recordRecommendationFeedback(
      req.user.userId.toString(),
      id,
      status ?? "none",
      rating ?? 5,
      feedbackText ?? ""
    );

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Recommendation not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    if (error instanceof Error && error.message === "Invalid recommendation identifier") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    next(error);
  }
};

export const getPendingAiRecommendationsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pending = await getPendingAiRecommendations();
    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
};

export const approveRecommendationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Missing recommendation ID" });
      return;
    }
    await approveRecommendation(id);
    res.status(200).json({ success: true, message: "Recommendation approved" });
  } catch (error) {
    if (error instanceof Error && (error.message === "Invalid recommendation identifier" || error.message === "Recommendation not found or already approved")) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const editAndApproveRecommendationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Missing recommendation ID" });
      return;
    }
    const { title, message, priority, category } = req.body;
    await editAndApproveRecommendation(id, { title, message, priority, category });
    res.status(200).json({ success: true, message: "Recommendation edited and approved" });
  } catch (error) {
    if (error instanceof Error && (error.message === "Invalid recommendation identifier" || error.message === "Recommendation not found")) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const rejectRecommendationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Missing recommendation ID" });
      return;
    }
    await rejectRecommendation(id);
    res.status(200).json({ success: true, message: "Recommendation rejected" });
  } catch (error) {
    if (error instanceof Error && (error.message === "Invalid recommendation identifier" || error.message === "Recommendation not found or already approved")) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const deleteRecommendationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Missing recommendation ID" });
      return;
    }

    await deleteRecommendation(req.user.userId.toString(), id);

    res.status(200).json({
      success: true,
      message: "Recommendation deleted",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid identifier") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    if (error instanceof Error && error.message === "Recommendation not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    next(error);
  }
};
