import { Types } from "mongoose";
import { Student } from "../../models/Student.js";
import { DailyAssessment } from "../../models/DailyAssessment.js";
import { Assessment } from "../../models/Assessment.js";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import { InitialAssessment } from "../../models/InitialAssessment.js";
import { AppError } from "../../middlewares/error.middleware.js";

/**
 * Calculate current and longest streaks from all assessment dates
 */
export const calculateStreaks = (assessmentDates: Date[], today: Date, isAddingToday: boolean = false) => {
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

/**
 * Recalculate streak for a student using ALL assessment records
 */
export const recalculateAndUpdateStreak = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { currentStreak, longestStreak } = calculateStreaks(allDates, today, false);

  // Update the student in DB
  await Student.findByIdAndUpdate(userId, {
    currentStreak,
    longestStreak
  });

  return { currentStreak, longestStreak };
};
