import { env } from '@/env';

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
 * Check if we're in development mode
 */
const isDevelopment = env.NODE_ENV === 'development';

/**
 * Enhanced logger with color support and debug mode
 */
export const log = {
  /**
   * Log informational messages
   *
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  info: (message: string, meta?: Record<string, unknown>) => {
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
   * Log error messages with prominent styling
   *
   * @param message - The error message to log
   * @param error - The error object or details
   */
  error: (message: string, error: unknown) => {
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
   * Log debug messages (only shown in development mode)
   *
   * @param message - The debug message to log
   * @param meta - Optional metadata to include with the log
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    // Only log in development mode
    if (!isDevelopment) return;

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
   * Log warning messages
   *
   * @param message - The warning message to log
   * @param meta - Optional metadata to include with the log
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
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
   * Log success messages
   *
   * @param message - The success message to log
   * @param meta - Optional metadata to include with the log
   */
  success: (message: string, meta?: Record<string, unknown>) => {
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
