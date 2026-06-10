import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import initialAssessmentRoutes from "./routes/initial-assessment.routes.js";
import weeklyAssessmentRoutes from "./routes/weekly-assessment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
const app = express();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Academic Burnout Detection Backend Running",
    });
});
app.use("/health", healthRouter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/initial-assessment", initialAssessmentRoutes);
app.use("/api/weekly-assessment", weeklyAssessmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/settings", settingsRoutes);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
app.use(errorMiddleware);
export default app;
//# sourceMappingURL=app.js.map