import cron from "node-cron";
import { Student } from "../models/Student.js";
import { Assessment } from "../models/Assessment.js";
import { WeeklyAssessment } from "../models/WeeklyAssessment.js";
import { NotificationService } from "../services/notification.service.js";
import { AccountStatus } from "../types/common.types.js";
import { logger } from "../utils/logger.js";

export const initializeReminderJob = (): void => {
  // Sunday at 9:00 AM: 0 9 * * 0
  cron.schedule("0 9 * * 0", async () => {
    logger.info("[Reminder Job] Starting weekly assessment reminder job");
    try {
      const activeStudents = await Student.find({ accountStatus: AccountStatus.Active });
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      for (const student of activeStudents) {
        // Check if student completed an assessment in the last 7 days
        const recentAssessment = await Assessment.findOne({
          student: student._id,
          status: "completed",
          completedAt: { $gte: sevenDaysAgo },
        }).lean();

        const recentWeeklyAssessment = await WeeklyAssessment.findOne({
          student: student._id,
          status: "completed",
          completedAt: { $gte: sevenDaysAgo },
        }).lean();

        if (recentAssessment || recentWeeklyAssessment) {
          logger.info(`[Reminder Job] Skipping student ${student.email} (completed assessment recently)`);
          continue;
        }

        await NotificationService.createAssessmentReminder(student._id);
        logger.info(`[Reminder Job] Sent assessment reminder to ${student.email}`);
      }
      logger.info("[Reminder Job] Completed weekly assessment reminder job");
    } catch (error) {
      logger.error("[Reminder Job] Error running weekly assessment reminder job:", error);
    }
  });
};
