import { Types } from "mongoose";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import { DailyAssessment } from "../../models/DailyAssessment.js";
import { Assessment } from "../../models/Assessment.js";
import { InitialAssessment } from "../../models/InitialAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import { calculateWeeklyBurnoutScore } from "../burnout/burnout-score.service.js";
import { initializeBaseline } from "../burnout/baseline-tracker.service.js";
import { generateAndStoreRecommendations, mapWeeklyAssessmentToRecommendationSnapshot } from "../recommendation/recommendation.service.js";
import type { WeeklyAssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IWeeklyAssessment } from "../../models/WeeklyAssessment.js";

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
        assessmentCompleted: true,
        currentBurnoutScore: burnoutScore,
        currentRiskLevel: classification.riskLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastAssessmentDate: today,
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

  return WeeklyAssessment.find({ student: new Types.ObjectId(userId) }).sort({ weekStartDate: -1, completedAt: -1, createdAt: -1 }).limit(10);
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
