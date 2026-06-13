import cron from "node-cron";
import { generateRiskAlerts } from "../services/trend-analysis.service.js";
import { logger } from "../utils/logger.js";

export const initializeTrendAnalysisJob = (): void => {
  // Every day at midnight: 0 0 * * *
  cron.schedule("0 0 * * *", async () => {
    logger.info("[Trend Analysis Job] Starting daily trend analysis job");
    try {
      await generateRiskAlerts();
      logger.info("[Trend Analysis Job] Completed daily trend analysis job");
    } catch (error) {
      logger.error("[Trend Analysis Job] Error running daily trend analysis job:", error);
    }
  });
};
