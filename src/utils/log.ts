import { env } from '@/env';

/**
 * Log levels enum in order of increasing verbosity
 */
export enum LogLevel {
  NONE = 0, // No logs
  ERROR = 1, // Only errors
  WARN = 2, // Errors and warnings
  SUCCESS = 3, // Errors, warnings, and success messages
  INFO = 4, // Errors, warnings, success, and info messages
  DEBUG = 5, // All logs including debug messages
}

/**
 * Parse log level from environment variable or default to INFO in production and DEBUG in development
 */
const getLogLevel = (): LogLevel => {
  const envLogLevel = env.LOG_LEVEL?.toUpperCase();

  if (!envLogLevel) {
    // Default to DEBUG in development, INFO in production
    return env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
  }

  switch (envLogLevel) {
    case 'NONE':
      return LogLevel.NONE;
    case 'ERROR':
      return LogLevel.ERROR;
    case 'WARN':
      return LogLevel.WARN;
    case 'SUCCESS':
      return LogLevel.SUCCESS;
    case 'INFO':
      return LogLevel.INFO;
    case 'DEBUG':
      return LogLevel.DEBUG;
    default:
      // If invalid value, use default based on environment
      return env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
  }
};

// Current log level based on environment
const currentLogLevel = getLogLevel();

/**
 * ANSI color codes for terminal styling
 */
const colors = {
  // Text colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',

  // Styles
  bold: '\x1b[1m',
  underline: '\x1b[4m',

  // Reset
  reset: '\x1b[0m',
};

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Enhanced logger with color support, debug mode, and log levels
 */
export const log = {
  /**
   * Get the current log level
   *
   * @returns The current log level
   */
  getLevel: () => currentLogLevel,

  /**
   * Log informational messages (level: INFO)
   *
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    if (currentLogLevel < LogLevel.INFO) return;

    if (isBrowser) {
      console.log(`%c[INFO] ${message}`, 'color: #0066cc', meta || '');
    } else {
      console.log(
        `${colors.blue}[INFO]${colors.reset} ${message}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },

  /**
   * Log error messages with prominent styling (level: ERROR)
   *
   * @param message - The error message to log
   * @param error - The error object or details
   */
  error: (message: string, error: unknown) => {
    if (currentLogLevel < LogLevel.ERROR) return;

    if (isBrowser) {
      console.error(
        `%c[ERROR] ${message}`,
        'color: #ffffff; background-color: #ff0000; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        error
      );
    } else {
      console.error(
        `${colors.bgRed}${colors.white}${colors.bold}[ERROR]${colors.reset} ${colors.red}${message}${colors.reset}`,
        error
      );
    }
  },

  /**
   * Log debug messages (level: DEBUG)
   *
   * @param message - The debug message to log
   * @param meta - Optional metadata to include with the log
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    // Check log level
    if (currentLogLevel < LogLevel.DEBUG) return;

    if (isBrowser) {
      console.log(
        `%c[DEBUG] ${message}`,
        'color: #ffffff; background-color: #6600cc; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        meta || ''
      );
    } else {
      console.log(
        `${colors.bgMagenta}${colors.white}${colors.bold}[DEBUG]${colors.reset} ${colors.magenta}${message}${colors.reset}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },

  /**
   * Log warning messages (level: WARN)
   *
   * @param message - The warning message to log
   * @param meta - Optional metadata to include with the log
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (currentLogLevel < LogLevel.WARN) return;

    if (isBrowser) {
      console.warn(
        `%c[WARN] ${message}`,
        'color: #000000; background-color: #ffcc00; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        meta || ''
      );
    } else {
      console.warn(
        `${colors.bgYellow}${colors.bold}[WARN]${colors.reset} ${colors.yellow}${message}${colors.reset}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },

  /**
   * Log success messages (level: SUCCESS)
   *
   * @param message - The success message to log
   * @param meta - Optional metadata to include with the log
   */
  success: (message: string, meta?: Record<string, unknown>) => {
    if (currentLogLevel < LogLevel.SUCCESS) return;

    if (isBrowser) {
      console.log(
        `%c[SUCCESS] ${message}`,
        'color: #ffffff; background-color: #00cc66; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        meta || ''
      );
    } else {
      console.log(
        `${colors.bgGreen}${colors.white}${colors.bold}[SUCCESS]${colors.reset} ${colors.green}${message}${colors.reset}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },
};
