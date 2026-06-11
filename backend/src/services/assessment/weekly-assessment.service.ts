import { Types } from "mongoose";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import { calculateWeeklyBurnoutScore } from "../burnout/burnout-score.service.js";
import { initializeBaseline } from "../burnout/baseline-tracker.service.js";
import { generateAndStoreRecommendations, mapWeeklyAssessmentToRecommendationSnapshot } from "../recommendation/recommendation.service.js";
import type { WeeklyAssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IWeeklyAssessment } from "../../models/WeeklyAssessment.js";

export const submitWeeklyAssessment = async (
  userId: string,
  assessment: WeeklyAssessmentRequestBody,
  maxWeeklyAssessments = 1,
): Promise<IWeeklyAssessment> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  const weekStartDate = getWeekStartDate();
  const maxAssessmentsForWeek = Number.isFinite(maxWeeklyAssessments)
    ? Math.max(1, Math.floor(maxWeeklyAssessments))
    : 1;

  const existingAssessmentCount = await WeeklyAssessment.countDocuments({
    student: new Types.ObjectId(userId),
    weekStartDate: {
      $gte: weekStartDate,
      $lt: new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  if (existingAssessmentCount >= maxAssessmentsForWeek) {
    throw new AppError("Weekly assessment already submitted for this week", 400);
  }

  const burnoutScore = calculateWeeklyBurnoutScore(assessment);
  const classification = classifyBurnoutRisk(burnoutScore);

  const burnoutScoreBreakdown = {
    academicLoad: assessment.academicLoadScore,
    stress: assessment.stressScore,
    sleepHours: assessment.sleepHoursAverage,
    sleepQuality: assessment.sleepQualityScore,
    mood: assessment.moodScore,
    motivation: assessment.motivationScore,
    concentration: assessment.concentrationScore,
    physicalFatigue: assessment.physicalFatigueScore,
  };

  const assessmentRecord = new WeeklyAssessment({
    student: new Types.ObjectId(userId),
    // Original weekly assessment fields
    academicLoadScore: assessment.academicLoadScore,
    stressScore: assessment.stressScore,
    sleepHoursAverage: assessment.sleepHoursAverage,
    sleepQualityScore: assessment.sleepQualityScore,
    moodScore: assessment.moodScore,
    motivationScore: assessment.motivationScore,
    concentrationScore: assessment.concentrationScore,
    physicalFatigueScore: assessment.physicalFatigueScore,
    // New fields from frontend form
    stressLevel: assessment.stressLevel,
    academicSatisfaction: assessment.academicSatisfaction,
    studyHours: assessment.studyHours,
    backlog: assessment.backlog,
    procrastination: assessment.procrastination,
    motivation: assessment.motivation,
    energy: assessment.energy,
    sleepHours: assessment.sleepHours,
    screenTime: assessment.screenTime,
    // Standard fields
    weekStartDate,
    burnoutScore,
    burnoutScoreBreakdown,
    riskLevel: classification.riskLevel,
    responses: { ...assessment },
    status: AssessmentStatus.Completed,
    completedAt: new Date(),
  });

  const createdAssessment = await assessmentRecord.save();

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      userId,
      {
        currentBurnoutScore: burnoutScore,
        currentRiskLevel: classification.riskLevel,
      },
      { new: true },
    );

    if (!updatedStudent) {
      throw new AppError("User not found", 404);
    }

    await initializeBaseline(userId, burnoutScore, classification.riskLevel, createdAssessment.completedAt ?? new Date());

    try {
      await generateAndStoreRecommendations(
        userId,
        createdAssessment._id.toString(),
        mapWeeklyAssessmentToRecommendationSnapshot(assessment),
      );
    } catch (error) {
      console.error("[Recommendation] Failed to generate weekly recommendations:", error);
    }
  } catch (error) {
    await WeeklyAssessment.findByIdAndDelete(createdAssessment._id).catch(() => null);
    throw error;
  }

  return createdAssessment;
};

export const getWeeklyAssessmentHistory = async (userId: string): Promise<IWeeklyAssessment[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return WeeklyAssessment.find({ student: new Types.ObjectId(userId) }).sort({ weekStartDate: -1, completedAt: -1, createdAt: -1 });
};

export const getLatestWeeklyAssessment = async (userId: string): Promise<IWeeklyAssessment | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return WeeklyAssessment.findOne({ student: new Types.ObjectId(userId) }).sort({ weekStartDate: -1, completedAt: -1, createdAt: -1 });
};

const getWeekStartDate = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};
