import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
const app = express();
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Academic Burnout Detection Backend Running",
    });
});
app.use("/health", healthRouter);
app.use("/api/auth", authRoutes);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
app.use(errorMiddleware);
export default app;
//# sourceMappingURL=app.js.map