import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { logger } from "./utils/logger.js";
import { initializeReminderJob } from "./jobs/reminder.job.js";
import { initializeTrendAnalysisJob } from "./jobs/trend-analysis.job.js";
import { initializeCleanupJob } from "./jobs/cleanup.job.js";
import { seedDefaultAdmin } from "./services/admin/admin.service.js";
const startServer = async () => {
    try {
        await connectDatabase();
        // Seed default admin account
        await seedDefaultAdmin();
        // Register weekly reminder, daily trend analysis, and cleanup cron jobs
        initializeReminderJob();
        initializeTrendAnalysisJob();
        initializeCleanupJob();
        logger.success("Cron jobs initialized successfully");
        const server = app.listen(config.port, () => {
            logger.success(`Server running on port ${config.port}`);
        });
        const shutdown = async (signal) => {
            logger.info(`${signal} received. Shutting down gracefully.`);
            server.close(async () => {
                await mongoose.disconnect();
                process.exit(0);
            });
        };
        process.on("SIGINT", () => {
            void shutdown("SIGINT");
        });
        process.on("SIGTERM", () => {
            void shutdown("SIGTERM");
        });
    }
    catch (error) {
        logger.error("Failed to start server", error instanceof Error ? error.message : error);
        process.exit(1);
    }
};
void startServer();
//# sourceMappingURL=server.js.map