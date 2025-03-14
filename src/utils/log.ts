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
 * HTTP method types for endpoint logging
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD';

/**
 * Endpoint information for logging
 */
export interface EndpointInfo {
  type?: HttpMethod;
  path?: string;
  util?: string; // Name of the utility or function generating the log
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
  gray: '\x1b[90m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgGray: '\x1b[100m',

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
 * Format endpoint information for display
 */
const formatEndpoint = (endpoint?: EndpointInfo): string => {
  if (!endpoint || (!endpoint.type && !endpoint.path && !endpoint.util))
    return '';

  const parts = [];
  if (endpoint.type) parts.push(endpoint.type);
  if (endpoint.path) parts.push(endpoint.path);

  // Format the output differently if util is provided
  if (endpoint.util) {
    return `[${parts.join(' ')} || ${endpoint.util}] `;
  }

  return `[${parts.join(' ')}] `;
};

/**
 * Enhanced logger with color support, debug mode, log levels, and endpoint information
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
   * @param metaOrEndpoint - Optional metadata or endpoint information
   * @param endpoint - Optional endpoint information if meta is provided
   */
  info: (
    message: string,
    metaOrEndpoint?: Record<string, unknown> | EndpointInfo,
    endpoint?: EndpointInfo
  ) => {
    if (currentLogLevel < LogLevel.INFO) return;

    let meta: Record<string, unknown> | undefined;
    let endpointInfo: EndpointInfo | undefined;

    // Determine if first optional param is metadata or endpoint
    if (metaOrEndpoint) {
      if (metaOrEndpoint.type || metaOrEndpoint.path || metaOrEndpoint.util) {
        endpointInfo = metaOrEndpoint as EndpointInfo;
      } else {
        meta = metaOrEndpoint as Record<string, unknown>;
        endpointInfo = endpoint;
      }
    }

    const endpointStr = formatEndpoint(endpointInfo);

    if (isBrowser) {
      console.log(
        `%c[INFO]%c ${endpointStr}${message}`,
        'color: #0066cc; font-weight: bold;',
        'color: inherit;',
        meta || ''
      );
    } else {
      console.log(
        `${colors.blue}${colors.bold}[INFO]${colors.reset} ${colors.cyan}${endpointStr}${colors.reset}${message}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },

  /**
   * Log error messages with prominent styling (level: ERROR)
   *
   * @param message - The error message to log
   * @param errorOrEndpoint - The error object or endpoint information
   * @param endpoint - Optional endpoint information if error is provided
   */
  error: (
    message: string,
    errorOrEndpoint?: unknown | EndpointInfo,
    endpoint?: EndpointInfo
  ) => {
    if (currentLogLevel < LogLevel.ERROR) return;

    let error: unknown;
    let endpointInfo: EndpointInfo | undefined;

    // Determine if first optional param is error or endpoint
    if (
      errorOrEndpoint &&
      typeof errorOrEndpoint === 'object' &&
      ((errorOrEndpoint as EndpointInfo).type ||
        (errorOrEndpoint as EndpointInfo).path ||
        (errorOrEndpoint as EndpointInfo).util)
    ) {
      endpointInfo = errorOrEndpoint as EndpointInfo;
    } else {
      error = errorOrEndpoint;
      endpointInfo = endpoint;
    }

    const endpointStr = formatEndpoint(endpointInfo);

    if (isBrowser) {
      console.error(
        `%c[ERROR]%c ${endpointStr}${message}`,
        'color: #ffffff; background-color: #ff0000; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #ff0000; font-weight: bold;',
        error
      );
    } else {
      console.error(
        `${colors.bgRed}${colors.white}${colors.bold}[ERROR]${colors.reset} ${colors.cyan}${endpointStr}${colors.reset}${colors.red}${message}${colors.reset}`,
        error
      );
    }
  },

  /**
   * Log debug messages (level: DEBUG)
   *
   * @param message - The debug message to log
   * @param metaOrEndpoint - Optional metadata or endpoint information
   * @param endpoint - Optional endpoint information if meta is provided
   */
  debug: (
    message: string,
    metaOrEndpoint?: Record<string, unknown> | EndpointInfo,
    endpoint?: EndpointInfo
  ) => {
    // Check log level
    if (currentLogLevel < LogLevel.DEBUG) return;

    let meta: Record<string, unknown> | undefined;
    let endpointInfo: EndpointInfo | undefined;

    // Determine if first optional param is metadata or endpoint
    if (metaOrEndpoint) {
      if (metaOrEndpoint.type || metaOrEndpoint.path || metaOrEndpoint.util) {
        endpointInfo = metaOrEndpoint as EndpointInfo;
      } else {
        meta = metaOrEndpoint as Record<string, unknown>;
        endpointInfo = endpoint;
      }
    }

    const endpointStr = formatEndpoint(endpointInfo);

    if (isBrowser) {
      console.log(
        `%c[DEBUG]%c ${endpointStr}${message}`,
        'color: #ffffff; background-color: #6600cc; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #6600cc;',
        meta || ''
      );
    } else {
      console.log(
        `${colors.bgMagenta}${colors.white}${colors.bold}[DEBUG]${colors.reset} ${colors.cyan}${endpointStr}${colors.reset}${colors.magenta}${message}${colors.reset}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },

  /**
   * Log warning messages (level: WARN)
   *
   * @param message - The warning message to log
   * @param metaOrEndpoint - Optional metadata or endpoint information
   * @param endpoint - Optional endpoint information if meta is provided
   */
  warn: (
    message: string,
    metaOrEndpoint?: Record<string, unknown> | EndpointInfo,
    endpoint?: EndpointInfo
  ) => {
    if (currentLogLevel < LogLevel.WARN) return;

    let meta: Record<string, unknown> | undefined;
    let endpointInfo: EndpointInfo | undefined;

    // Determine if first optional param is metadata or endpoint
    if (metaOrEndpoint) {
      if (metaOrEndpoint.type || metaOrEndpoint.path || metaOrEndpoint.util) {
        endpointInfo = metaOrEndpoint as EndpointInfo;
      } else {
        meta = metaOrEndpoint as Record<string, unknown>;
        endpointInfo = endpoint;
      }
    }

    const endpointStr = formatEndpoint(endpointInfo);

    if (isBrowser) {
      console.warn(
        `%c[WARN]%c ${endpointStr}${message}`,
        'color: #000000; background-color: #ffcc00; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #cc9900; font-weight: bold;',
        meta || ''
      );
    } else {
      console.warn(
        `${colors.bgYellow}${colors.bold}[WARN]${colors.reset} ${colors.cyan}${endpointStr}${colors.reset}${colors.yellow}${message}${colors.reset}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },

  /**
   * Log success messages (level: SUCCESS)
   *
   * @param message - The success message to log
   * @param metaOrEndpoint - Optional metadata or endpoint information
   * @param endpoint - Optional endpoint information if meta is provided
   */
  success: (
    message: string,
    metaOrEndpoint?: Record<string, unknown> | EndpointInfo,
    endpoint?: EndpointInfo
  ) => {
    if (currentLogLevel < LogLevel.SUCCESS) return;

    let meta: Record<string, unknown> | undefined;
    let endpointInfo: EndpointInfo | undefined;

    // Determine if first optional param is metadata or endpoint
    if (metaOrEndpoint) {
      if (metaOrEndpoint.type || metaOrEndpoint.path || metaOrEndpoint.util) {
        endpointInfo = metaOrEndpoint as EndpointInfo;
      } else {
        meta = metaOrEndpoint as Record<string, unknown>;
        endpointInfo = endpoint;
      }
    }

    const endpointStr = formatEndpoint(endpointInfo);

    if (isBrowser) {
      console.log(
        `%c[SUCCESS]%c ${endpointStr}${message}`,
        'color: #ffffff; background-color: #00cc66; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #00cc66; font-weight: bold;',
        meta || ''
      );
    } else {
      console.log(
        `${colors.bgGreen}${colors.white}${colors.bold}[SUCCESS]${colors.reset} ${colors.cyan}${endpointStr}${colors.reset}${colors.green}${message}${colors.reset}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },
};
