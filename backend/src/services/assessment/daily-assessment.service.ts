import { Types } from "mongoose";
import { DailyAssessment } from "../../models/DailyAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { calculateBurnoutScore } from "../burnout/burnout-score.service.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import { initializeBaseline } from "../burnout/baseline-tracker.service.js";
import { generateAndStoreRecommendations } from "../recommendation/recommendation.service.js";
import type { AssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IDailyAssessment } from "../../models/DailyAssessment.js";

export const submitDailyAssessment = async (
  userId: string,
  assessment: AssessmentRequestBody
): Promise<IDailyAssessment> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAssessment = await DailyAssessment.findOne({
    student: new Types.ObjectId(userId),
    date: today,
  });

  if (existingAssessment) {
    throw new AppError("You have already submitted an assessment today", 400);
  }

  const { burnoutScore, burnoutScoreBreakdown } = calculateBurnoutScore(assessment);
  const classification = classifyBurnoutRisk(burnoutScore);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayAssessment = await DailyAssessment.findOne({
    student: new Types.ObjectId(userId),
    date: yesterday,
  });

  let newStreak = 1;
  let newLongestStreak = student.longestStreak;

  if (yesterdayAssessment) {
    newStreak = student.currentStreak + 1;
  }

  if (newStreak > newLongestStreak) {
    newLongestStreak = newStreak;
  }

  const assessmentRecord = new DailyAssessment({
    student: new Types.ObjectId(userId),
    date: today,
    ...assessment,
    burnoutScore,
    burnoutScoreBreakdown,
    riskLevel: classification.riskLevel,
    riskDescription: classification.riskDescription,
    responses: { ...assessment },
    status: AssessmentStatus.Completed,
    completedAt: new Date(),
  });

  const createdAssessment = await assessmentRecord.save();

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      userId,
      {
        assessmentCompleted: true,
        currentBurnoutScore: burnoutScore,
        currentRiskLevel: classification.riskLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastAssessmentDate: today,
      },
      { new: true }
    );

    if (updatedStudent) {
      await initializeBaseline(userId, burnoutScore, classification.riskLevel, createdAssessment.completedAt ?? new Date());
    }

    if (!updatedStudent) {
      throw new AppError("User not found", 404);
    }

    try {
      await generateAndStoreRecommendations(userId, createdAssessment._id.toString(), assessment);
    } catch (error) {
      console.error("[Recommendation] Failed to generate recommendations:", error);
    }
  } catch (error) {
    await DailyAssessment.findByIdAndDelete(createdAssessment._id).catch(() => null);
    throw error;
  }

  return createdAssessment;
};

export const getDailyAssessmentHistory = async (userId: string): Promise<IDailyAssessment[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return DailyAssessment.find({ student: new Types.ObjectId(userId) }).sort({ date: -1 }).limit(30);
};

export const getLatestDailyAssessment = async (userId: string): Promise<IDailyAssessment | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return DailyAssessment.findOne({ student: new Types.ObjectId(userId) }).sort({ date: -1 });
};

