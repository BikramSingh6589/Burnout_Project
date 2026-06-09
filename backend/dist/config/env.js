"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
// Validate that required variables are defined in the environment (even if they are empty strings)
requiredEnv.forEach((key) => {
    if (process.env[key] === undefined) {
        throw new Error(`Missing ${key} in environment variables.`);
    }
});
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    emailUser: process.env.EMAIL_USER || '',
    emailPassword: process.env.EMAIL_PASSWORD || '',
    env: process.env.NODE_ENV || 'development',
};
