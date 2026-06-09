<<<<<<< Updated upstream
import mongoose from "mongoose";
export const connectDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not configured");
=======
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const env_1 = require("./env");
const setupConnectionEvents = () => {
    const { connection } = mongoose_1.default;
    connection.on('connected', () => {
        logger_1.logger.success('MongoDB Connected');
    });
    connection.on('disconnected', () => {
        logger_1.logger.warn('MongoDB Disconnected');
    });
    connection.on('reconnected', () => {
        logger_1.logger.success('MongoDB Reconnected');
    });
    connection.on('error', (error) => {
        logger_1.logger.error('MongoDB Connection Error', error);
    });
};
/**
 * Connects to the MongoDB Atlas database.
 * If the connection fails, it exits the process after logging.
 */
const connectDatabase = async () => {
    setupConnectionEvents();
    try {
        if (!env_1.config.mongoUri) {
            throw new Error('MONGO_URI is empty');
        }
        await mongoose_1.default.connect(env_1.config.mongoUri);
        logger_1.logger.info('Database connection established.');
    }
    catch (error) {
        logger_1.logger.error('✗ MongoDB Connection Failed:', error instanceof Error ? error.message : error);
        process.exit(1);
>>>>>>> Stashed changes
    }
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
};
export const disconnectDatabase = async () => {
    await mongoose.disconnect();
};
//# sourceMappingURL=database.js.map