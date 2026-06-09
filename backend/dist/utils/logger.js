"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const colors = {
    reset: '\x1b[0m',
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
};
exports.logger = {
    info: (message, ...optionalParams) => {
        console.log(`${colors.info}[INFO]${colors.reset} ${message}`, ...optionalParams);
    },
    success: (message, ...optionalParams) => {
        console.log(`${colors.success}[SUCCESS]${colors.reset} ${message}`, ...optionalParams);
    },
    warn: (message, ...optionalParams) => {
        console.warn(`${colors.warn}[WARN]${colors.reset} ${message}`, ...optionalParams);
    },
    error: (message, ...optionalParams) => {
        console.error(`${colors.error}[ERROR]${colors.reset} ${message}`, ...optionalParams);
    }
};
