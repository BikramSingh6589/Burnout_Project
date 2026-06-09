const colors = {
    reset: '\x1b[0m',
    info: '\x1b[36m',
    success: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
};
export const logger = {
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
    },
};
//# sourceMappingURL=logger.js.map