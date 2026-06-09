import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDatabase } from "./config/database.js";
import { HttpError } from "./controllers/auth.controller.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();
const port = Number(process.env.PORT ?? 5001);
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? ["http://localhost:5173"],
    credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/auth", authRoutes);
app.use((_req, _res, next) => {
    next(new HttpError(404, "Route not found"));
});
app.use((error, _req, res, _next) => {
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    if (statusCode >= 500) {
        console.error(error);
    }
    res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "Internal server error" : error.message,
    });
});
const startServer = async () => {
    try {
        await connectDatabase();
        const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down gracefully.`);
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
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
void startServer();
export default app;
//# sourceMappingURL=server.js.map