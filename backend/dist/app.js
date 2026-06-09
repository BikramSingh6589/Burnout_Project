"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
// CORS Configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173'], // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
}));
// Logging Middleware
app.use((0, morgan_1.default)('dev'));
// Body Parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Root Health Check Route
app.get('/', (req, res) => {
    const response = {
        success: true,
        message: 'Academic Burnout Detection Backend Running',
    };
    res.status(200).json(response);
});
// Detailed Health Check Route
app.get('/health', (_req, res) => {
    const databaseState = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    const response = {
        status: databaseState === 'connected' ? 'ok' : 'error',
        database: databaseState,
    };
    const statusCode = databaseState === 'connected' ? 200 : 503;
    res.status(statusCode).json(response);
});
// Global Error Handler Middleware (must be registered last)
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
