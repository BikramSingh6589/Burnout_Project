import cron from "node-cron";
import { Types } from "mongoose";
import { Student } from "../models/Student.js";
import { DailyAssessment } from "../models/DailyAssessment.js";
import { Assessment } from "../models/Assessment.js";
import { NotificationService } from "../services/notification.service.js";
import { AccountStatus, AssessmentStatus } from "../types/common.types.js";
import { logger } from "../utils/logger.js";
import { sendWeeklyStreakSummaryEmail } from "../utils/email.js";

/**
 * Calculate current and longest streaks from all assessment dates
 */
const calculateStreaksForStudent = async (studentId: string) => {
  const [dailyAssessments, initialAssessments] = await Promise.all([
    DailyAssessment.find({ student: new Types.ObjectId(studentId) }).select('date'),
    Assessment.find({ student: new Types.ObjectId(studentId) }).select('completedAt')
  ]);

  const allDates: Date[] = [
    ...dailyAssessments.map(a => a.date),
    ...initialAssessments.map(a => a.completedAt)
  ].filter(Boolean) as Date[];

  if (allDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert all dates to YYYY-MM-DD strings and sort them
  const dateStrings = allDates
    .map(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    })
    .filter((value, index, array) => array.indexOf(value) === index) // Remove duplicates
    .sort();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if last assessment is today or yesterday
  const lastDateStr = dateStrings[dateStrings.length - 1];
  const lastDate = new Date(lastDateStr);
  const diffToday = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);

  if (diffToday <= 1) {
    currentStreak = 1;
    // Iterate from the end to calculate current streak
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
  }

  // Calculate longest streak
  if (dateStrings.length > 0) {
    longestStreak = 1;
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
  }

  return { currentStreak, longestStreak };
};

/**
 * Daily job to check and reset streaks if needed
 */
export const runDailyStreakCheckJob = async (): Promise<void> => {
  logger.info("[Streak Job] Starting daily streak check job");
  
  try {
    const activeStudents = await Student.find({ accountStatus: AccountStatus.Active });

    for (const student of activeStudents) {
      try {
        const { currentStreak, longestStreak } = await calculateStreaksForStudent(student._id.toString());
        
        // Update student if streaks changed
        if (student.currentStreak !== currentStreak || student.longestStreak !== longestStreak) {
          await Student.findByIdAndUpdate(student._id, {
            currentStreak,
            longestStreak
          });
          logger.info(`[Streak Job] Updated streaks for ${student.email}: current=${currentStreak}, longest=${longestStreak}`);
        }
      } catch (error) {
        logger.error(`[Streak Job] Failed to check streaks for ${student.email}:`, error);
      }
    }
    logger.info("[Streak Job] Completed daily streak check job");
  } catch (error) {
    logger.error("[Streak Job] Error running daily streak check job:", error);
    throw error;
  }
};

const getDaysCompletedThisWeek = async (studentId: string): Promise<number> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const count = await DailyAssessment.countDocuments({
    student: studentId,
    date: { $gte: startOfWeek },
    status: AssessmentStatus.Completed
  });

  return count;
};

export const runWeeklyReminderJob = async (): Promise<{ sent: number; skipped: number }> => {
  logger.info("[Reminder Job] Starting weekly streak summary job");
  let sentCount = 0;
  let skippedCount = 0;
  
  try {
    const activeStudents = await Student.find({ accountStatus: AccountStatus.Active });

    for (const student of activeStudents) {
      try {
        const daysCompletedThisWeek = await getDaysCompletedThisWeek(student._id.toString());
        
        await sendWeeklyStreakSummaryEmail(
          student.email,
          student.fullName,
          student.currentStreak,
          student.longestStreak,
          daysCompletedThisWeek
        );
        logger.info(`[Reminder Job] Sent weekly streak summary to ${student.email}`);
        sentCount++;
        
        await NotificationService.createAssessmentReminder(student._id);
      } catch (emailError) {
        logger.error(`[Reminder Job] Failed to send email to ${student.email}:`, emailError);
        skippedCount++;
      }
    }
    logger.info(`[Reminder Job] Completed weekly streak summary job - sent ${sentCount}, skipped ${skippedCount}`);
    return { sent: sentCount, skipped: skippedCount };
  } catch (error) {
    logger.error("[Reminder Job] Error running weekly streak summary job:", error);
    throw error;
  }
};

export const initializeReminderJob = (): void => {
  // Daily streak check at 00:01 every day
  cron.schedule("1 0 * * *", async () => {
    await runDailyStreakCheckJob();
  });

  // Weekly reminder at 09:00 every Sunday
  cron.schedule("0 9 * * 0", async () => {
    await runWeeklyReminderJob();
  });
};
