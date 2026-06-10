import type { NextFunction, Request, Response } from "express";
import { Recommendation } from "../models/Recommendation.js";
import { StudentRecommendation } from "../models/StudentRecommendation.js";
import { RecommendationFeedback } from "../models/RecommendationFeedback.js";
import { RecommendationCategory, RecommendationPriority, RecommendationStatus, RiskLevel } from "../types/common.types.js";
import { Types } from "mongoose";

const DEFAULT_RECOMMENDATIONS = [
  {
    title: "Earlier Sleep Schedule",
    description: "Your sleep patterns suggest late hours, contributing to stress. Aim for a consistent 7.5+ hour window.",
    category: RecommendationCategory.Sleep,
    priority: RecommendationPriority.High,
    targetRiskLevels: [RiskLevel.Moderate, RiskLevel.High, RiskLevel.Critical],
    actionSteps: ["Set a bedtime alarm", "No screens 1 hour before bed"],
  },
  {
    title: "Reduce Screen Time before Bed",
    description: "Evening screen exposure correlates with insomnia and high fatigue levels.",
    category: RecommendationCategory.Sleep,
    priority: RecommendationPriority.High,
    targetRiskLevels: [RiskLevel.Moderate, RiskLevel.High, RiskLevel.Critical],
    actionSteps: ["Read a physical book instead", "Keep phone across the room"],
  },
  {
    title: "Take Structured Study Breaks (Pomodoro)",
    description: "Continuous study without pauses reduces academic satisfaction and motivation scores.",
    category: RecommendationCategory.TimeManagement,
    priority: RecommendationPriority.Medium,
    targetRiskLevels: [RiskLevel.Low, RiskLevel.Moderate, RiskLevel.High],
    actionSteps: ["Study for 50 minutes", "Take a 10-minute walk break"],
  },
  {
    title: "Break Down Backlog into Micro-Tasks",
    description: "Accumulated tasks increase stress and trigger procrastination cycles.",
    category: RecommendationCategory.TimeManagement,
    priority: RecommendationPriority.High,
    targetRiskLevels: [RiskLevel.Moderate, RiskLevel.High, RiskLevel.Critical],
    actionSteps: ["List all tasks", "Complete one simple task first"],
  },
];

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

    const userId = req.user.userId.toString();

    // Check if user has assigned recommendations
    let studentRecs = await StudentRecommendation.find({
      student: new Types.ObjectId(userId),
    }).populate("recommendation");

    if (studentRecs.length === 0) {
      // Seed global recommendations first if they do not exist
      for (const item of DEFAULT_RECOMMENDATIONS) {
        let rec = await Recommendation.findOne({ title: item.title });
        if (!rec) {
          rec = new Recommendation(item);
          await rec.save();
        }

        // Assign to user
        const studentRec = new StudentRecommendation({
          student: new Types.ObjectId(userId),
          recommendation: rec._id,
          priority: item.priority,
          status: RecommendationStatus.Assigned,
          personalizationReason: item.description,
        });
        await studentRec.save();
      }

      studentRecs = await StudentRecommendation.find({
        student: new Types.ObjectId(userId),
      }).populate("recommendation");
    }

    // Fetch feedbacks to populate details
    const formattedRecs = await Promise.all(
      studentRecs.map(async (sr) => {
        const feedback = await RecommendationFeedback.findOne({
          studentRecommendation: sr._id,
        });

        let followedStatus: "none" | "followed" | "partially" | "not" = "none";
        if (sr.status === RecommendationStatus.Completed) followedStatus = "followed";
        else if (sr.status === RecommendationStatus.InProgress) followedStatus = "partially";
        else if (sr.status === RecommendationStatus.Dismissed) followedStatus = "not";

        const recDoc = sr.recommendation as any;

        return {
          id: sr._id.toString(),
          title: recDoc?.title ?? "Recommendation",
          reason: sr.personalizationReason ?? recDoc?.description ?? "",
          priority: sr.priority.charAt(0).toUpperCase() + sr.priority.slice(1),
          followedStatus,
          rating: feedback?.rating ?? 0,
          feedbackText: feedback?.comment ?? "",
          dateGenerated: sr.createdAt.toISOString().split("T")[0],
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedRecs,
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

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid recommendation ID" });
      return;
    }

    const studentRec = await StudentRecommendation.findOne({
      _id: new Types.ObjectId(id),
      student: new Types.ObjectId(req.user.userId.toString()),
    });

    if (!studentRec) {
      res.status(404).json({ success: false, message: "Recommendation mapping not found" });
      return;
    }

    let dbStatus = RecommendationStatus.Assigned;
    if (status === "followed") dbStatus = RecommendationStatus.Completed;
    else if (status === "partially") dbStatus = RecommendationStatus.InProgress;
    else if (status === "not") dbStatus = RecommendationStatus.Dismissed;

    studentRec.status = dbStatus;
    await studentRec.save();

    await RecommendationFeedback.findOneAndUpdate(
      { studentRecommendation: studentRec._id },
      {
        student: new Types.ObjectId(req.user.userId.toString()),
        studentRecommendation: studentRec._id,
        rating: rating ?? 5,
        helpful: status === "followed" || status === "partially",
        comment: feedbackText ?? "",
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};
