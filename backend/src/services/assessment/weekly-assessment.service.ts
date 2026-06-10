import { Types } from "mongoose";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import type { WeeklyAssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IWeeklyAssessment } from "../../models/WeeklyAssessment.js";

export const submitWeeklyAssessment = async (
  userId: string,
  assessment: WeeklyAssessmentRequestBody,
): Promise<IWeeklyAssessment> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  // Calculate week start date (Monday of current week)
  const weekStartDate = getWeekStartDate();

  // Check if assessment for this week already exists
  const existingAssessment = await WeeklyAssessment.findOne({
    student: new Types.ObjectId(userId),
    weekStartDate: {
      $gte: weekStartDate,
      $lt: new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  if (existingAssessment) {
    throw new AppError("Weekly assessment already submitted for this week", 400);
  }

  const burnoutScore = calculateWeeklyBurnoutScore(assessment);
  const classification = classifyBurnoutRisk(burnoutScore);

  const assessmentRecord = new WeeklyAssessment({
    student: new Types.ObjectId(userId),
    ...assessment,
    weekStartDate,
    burnoutScore,
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

  return WeeklyAssessment.find({ student: new Types.ObjectId(userId) }).sort({ weekStartDate: -1 });
};

export const getLatestWeeklyAssessment = async (userId: string): Promise<IWeeklyAssessment | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return WeeklyAssessment.findOne({ student: new Types.ObjectId(userId) }).sort({ weekStartDate: -1 });
};

const getWeekStartDate = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const calculateWeeklyBurnoutScore = (assessment: WeeklyAssessmentRequestBody): number => {
  const {
    academicLoadScore,
    stressScore,
    sleepHoursAverage,
    sleepQualityScore,
    moodScore,
    motivationScore,
    concentrationScore,
    physicalFatigueScore,
  } = assessment;

  const MAX_SCORE = 100;
  const MIN_SCORE = 0;

  // Inverted scores (lower is better, but we want it to contribute to burnout)
  const invertedMood = 100 - moodScore;
  const invertedMotivation = 100 - motivationScore;
  const invertedConcentration = 100 - concentrationScore;
  const invertedSleepQuality = 100 - sleepQualityScore;
  const sleepPenalty = Math.max(0, 8 - sleepHoursAverage) * 5;

  // Weighted calculation for weekly burnout
  const weightedTotal =
    academicLoadScore * 0.15 +
    stressScore * 0.2 +
    sleepPenalty * 0.15 +
    invertedSleepQuality * 0.1 +
    invertedMood * 0.15 +
    invertedMotivation * 0.15 +
    invertedConcentration * 0.05 +
    physicalFatigueScore * 0.05;

  const score = Math.round(weightedTotal);

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));
};
