"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const env_1 = require("./env");
/**
 * Connects to the MongoDB Atlas database.
 * If the connection fails, it throws an error to be handled by the server initializer.
 */
const connectDatabase = async () => {
    try {
        if (!env_1.config.mongoUri) {
            throw new Error('MONGODB_URI is empty');
        }
        // Set connection options if needed (Mongoose 6+ has no deprecated options like useNewUrlParser/useUnifiedTopology anymore)
        await mongoose_1.default.connect(env_1.config.mongoUri);
        logger_1.logger.success('✓ MongoDB Connected');
    }
    catch (error) {
        logger_1.logger.error(`✗ MongoDB Connection Failed: ${error.message}`);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
