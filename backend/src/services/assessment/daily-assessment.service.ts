import { Types } from "mongoose";
import { DailyAssessment } from "../../models/DailyAssessment.js";
import { Assessment } from "../../models/Assessment.js";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import { InitialAssessment } from "../../models/InitialAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { calculateBurnoutScore } from "../burnout/burnout-score.service.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import { initializeBaseline } from "../burnout/baseline-tracker.service.js";
import { generateAndStoreRecommendations } from "../recommendation/recommendation.service.js";
import type { AssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IDailyAssessment } from "../../models/DailyAssessment.js";

/**
 * Calculate current and longest streaks from all assessment dates
 */
const calculateStreaks = (assessmentDates: Date[], today: Date, isAddingToday: boolean = false) => {
  // Convert all dates to YYYY-MM-DD strings, remove duplicates, and sort in descending order (newest first)
  const dateStrings = assessmentDates
    .map(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    })
    .filter((value, index, array) => array.indexOf(value) === index) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort newest first

  // Add today to the list ONLY if we are adding a new assessment today
  const todayStr = today.toISOString().split('T')[0];
  if (isAddingToday && !dateStrings.includes(todayStr)) {
    dateStrings.unshift(todayStr); // Add to beginning (newest)
  }

  if (dateStrings.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate current streak
  let currentStreak = 0;
  let prevDate = new Date(dateStrings[0]);
  prevDate.setHours(0, 0, 0, 0);
  
  // Check if the first date is either today or yesterday
  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);
  
  const diffDays = (todayDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffDays <= 1 && diffDays >= 0) {
    currentStreak = 1;
    for (let i = 1; i < dateStrings.length; i++) {
      const current = new Date(dateStrings[i]);
      current.setHours(0, 0, 0, 0);
      const dayDiff = (prevDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) {
        currentStreak++;
        prevDate = current;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  let tempPrevDate = new Date(dateStrings[0]);
  tempPrevDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < dateStrings.length; i++) {
    const current = new Date(dateStrings[i]);
    current.setHours(0, 0, 0, 0);
    const dayDiff = (tempPrevDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 1;
    }
    tempPrevDate = current;
  }

  // If there's only one date, longest streak is 1
  if (longestStreak === 0 && dateStrings.length > 0) {
    longestStreak = 1;
  }

  return { currentStreak, longestStreak };
};

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

  // Get all assessment dates from ALL assessment types
  const [dailyAssessments, initialAssessments, weeklyAssessments, assessments] = await Promise.all([
    DailyAssessment.find({ student: new Types.ObjectId(userId) }).select('date'),
    InitialAssessment.find({ student: new Types.ObjectId(userId) }).select('completedAt'),
    WeeklyAssessment.find({ student: new Types.ObjectId(userId) }).select('completedAt'),
    Assessment.find({ student: new Types.ObjectId(userId) }).select('completedAt')
  ]);

  const allDates: Date[] = [
    ...dailyAssessments.map(a => a.date),
    ...initialAssessments.map(a => a.completedAt),
    ...weeklyAssessments.map(a => a.completedAt),
    ...assessments.map(a => a.completedAt)
  ].filter(Boolean) as Date[];

  const { currentStreak: newStreak, longestStreak: newLongestStreak } = calculateStreaks(allDates, today, true);

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

