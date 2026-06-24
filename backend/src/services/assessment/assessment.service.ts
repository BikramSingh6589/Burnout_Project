import { Types } from "mongoose";
import { Assessment } from "../../models/Assessment.js";
import { DailyAssessment } from "../../models/DailyAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { calculateBurnoutScore } from "../burnout/burnout-score.service.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import { initializeBaseline } from "../burnout/baseline-tracker.service.js";
import { generateAndStoreRecommendations } from "../recommendation/recommendation.service.js";
import type { AssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IAssessment } from "../../models/Assessment.js";

/**
 * Calculate current and longest streaks from all assessment dates
 */
const calculateStreaks = (assessmentDates: Date[], today: Date) => {
  if (assessmentDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert all dates to YYYY-MM-DD strings and sort them
  const dateStrings = assessmentDates
    .map(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    })
    .filter((value, index, array) => array.indexOf(value) === index) // Remove duplicates
    .sort();

  // Add today to the list since we're submitting a new assessment
  const todayStr = today.toISOString().split('T')[0];
  dateStrings.push(todayStr);
  dateStrings.sort();

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  // Iterate from the end to calculate current streak first
  for (let i = dateStrings.length - 2; i >= 0; i--) {
    const current = new Date(dateStrings[i + 1]);
    const prev = new Date(dateStrings[i]);
    const diffDays = (current.getTime() - prev.getTime()) / (1000 * 3600 * 24);

    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (let i = 1; i < dateStrings.length; i++) {
    const current = new Date(dateStrings[i]);
    const prev = new Date(dateStrings[i - 1]);
    const diffDays = (current.getTime() - prev.getTime()) / (1000 * 3600 * 24);

    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak };
};

export const submitAssessment = async (userId: string, assessment: AssessmentRequestBody): Promise<IAssessment> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  const { burnoutScore, burnoutScoreBreakdown } = calculateBurnoutScore(assessment);
  const classification = classifyBurnoutRisk(burnoutScore);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all assessment dates from both DailyAssessment and Assessment
  const [dailyAssessments, initialAssessments] = await Promise.all([
    DailyAssessment.find({ student: new Types.ObjectId(userId) }).select('date'),
    Assessment.find({ student: new Types.ObjectId(userId) }).select('completedAt')
  ]);

  const allDates: Date[] = [
    ...dailyAssessments.map(a => a.date),
    ...initialAssessments.map(a => a.completedAt)
  ].filter(Boolean) as Date[];

  const { currentStreak: newStreak, longestStreak: newLongestStreak } = calculateStreaks(allDates, today);

  const assessmentRecord = new Assessment({
    student: new Types.ObjectId(userId),
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
      { new: true },
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
    await Assessment.findByIdAndDelete(createdAssessment._id).catch(() => null);
    throw error;
  }

  return createdAssessment;
};

export const getAssessmentHistory = async (userId: string): Promise<IAssessment[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return Assessment.find({ student: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(10);
};

export const getLatestAssessment = async (userId: string): Promise<IAssessment | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return Assessment.findOne({ student: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
};
