import cron from "node-cron";
import { Recommendation } from "../models/Recommendation.js";
import { logger } from "../utils/logger.js";

export const initializeCleanupJob = (): void => {
  // Run daily at 2 AM
  cron.schedule("0 2 * * *", async () => {
    logger.info("[Cleanup Job] Starting recommendation cleanup job");
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const deleteResult = await Recommendation.deleteMany({
        deletedAt: { $lte: thirtyDaysAgo },
      });

      logger.info(`[Cleanup Job] Deleted ${deleteResult.deletedCount} expired recommendations`);
    } catch (error) {
      logger.error("[Cleanup Job] Error running recommendation cleanup job:", error);
    }
  });
};
