const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m',     // Cyan
  success: '\x1b[32m',  // Green
  warn: '\x1b[33m',     // Yellow
  error: '\x1b[31m',    // Red
};

export const logger = {
  info: (message: string, ...optionalParams: any[]) => {
    console.log(`${colors.info}[INFO]${colors.reset} ${message}`, ...optionalParams);
  },
  success: (message: string, ...optionalParams: any[]) => {
    console.log(`${colors.success}[SUCCESS]${colors.reset} ${message}`, ...optionalParams);
  },
  warn: (message: string, ...optionalParams: any[]) => {
    console.warn(`${colors.warn}[WARN]${colors.reset} ${message}`, ...optionalParams);
  },
  error: (message: string, ...optionalParams: any[]) => {
    console.error(`${colors.error}[ERROR]${colors.reset} ${message}`, ...optionalParams);
  }
};
