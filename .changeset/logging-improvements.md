---
"web": minor
---

## Logging System Improvements

Enhanced the logging system with configurable log levels to provide better control over application logs.

- Added a LogLevel enum with six levels: NONE, ERROR, WARN, SUCCESS, INFO, and DEBUG
- Implemented a LOG_LEVEL environment variable to control log verbosity
- Updated the env.ts file to include the new LOG_LEVEL configuration
- Modified all logging functions to respect the current log level
- Added a getLevel() method to check the current log level
- Set sensible defaults based on the environment (DEBUG in development, INFO in production)
- Removed the isDevelopment check in favor of the more flexible log level system
- Improved documentation for all logging functions

This enhancement allows developers to control the verbosity of logs by setting the LOG_LEVEL environment variable, making it easier to focus on important messages in different environments. For example, setting LOG_LEVEL=ERROR will only show error messages, while LOG_LEVEL=DEBUG will show all messages including debug information. 