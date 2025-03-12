import { log, LogLevel } from './log';

/**
 * Example of how to use the enhanced logging system
 *
 * This file demonstrates the different log levels and how they can be used
 * in your application. You can control which logs are displayed by setting
 * the LOG_LEVEL environment variable.
 *
 * LOG_LEVEL options:
 * - NONE: No logs will be displayed
 * - ERROR: Only error logs will be displayed
 * - WARN: Error and warning logs will be displayed
 * - SUCCESS: Error, warning, and success logs will be displayed
 * - INFO: Error, warning, success, and info logs will be displayed
 * - DEBUG: All logs will be displayed (default in development)
 *
 * If LOG_LEVEL is not set, it defaults to:
 * - DEBUG in development
 * - INFO in production
 */
export function logExamples() {
  // Get the current log level
  const currentLevel = log.getLevel();
  log.info(`Current log level: ${LogLevel[currentLevel]}`);

  // Example of each log type
  log.debug('This is a debug message', { detail: 'Extra debug information' });
  log.info('This is an info message', { user: 'example-user' });
  log.success('This is a success message', { operation: 'completed' });
  log.warn('This is a warning message', {
    warning: 'Something might be wrong',
  });
  log.error('This is an error message', new Error('Example error'));

  // Example of conditional logging based on log level
  if (currentLevel >= LogLevel.DEBUG) {
    // Expensive operation that should only run in debug mode
    const debugData = {
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
    };
    log.debug('Detailed system information', debugData);
  }
}

/**
 * Example of how to use logging in an API route
 */
export async function apiRouteLoggingExample(req: Request) {
  try {
    // Log the incoming request
    log.info('API request received', {
      url: req.url,
      method: req.method,
    });

    // Process the request
    log.debug('Processing request', {
      headers: Object.fromEntries(req.headers.entries()),
    });

    // Simulate successful response
    log.success('API request processed successfully');

    return new Response('Success', { status: 200 });
  } catch (error) {
    // Log the error
    log.error('Error processing API request', error);

    return new Response('Internal Server Error', { status: 500 });
  }
}
