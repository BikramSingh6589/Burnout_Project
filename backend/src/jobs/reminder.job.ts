import cron from "node-cron";
import { Student } from "../models/Student.js";
import { DailyAssessment } from "../models/DailyAssessment.js";
import { NotificationService } from "../services/notification.service.js";
import { AccountStatus, AssessmentStatus } from "../types/common.types.js";
import { logger } from "../utils/logger.js";
import { sendWeeklyStreakSummaryEmail } from "../utils/email.js";

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
  cron.schedule("0 9 * * 0", async () => {
    await runWeeklyReminderJob();
  });
};
