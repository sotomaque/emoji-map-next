# web

## 0.3.2

### Patch Changes

- f951abb: make services use local images instead of network requests; update readme with deployment process

## 0.3.1 (03-22-25)

### Patch Changes

- 2f1eb41: no longer delete user directly in db after we delete clerk user; let webhook take care of it
- 658e61f: add linear + zoho to services; change support email to zoho created email
- e8771ce: Wrap Auth Components

## 0.3.0 (03-21-25)

### Minor Changes

- aeba6a4: add delete user endpoint and page

### Patch Changes

- 925ab53: move shared styles to layout; fix mobile light /dark mode issues; make account

## 0.2.1 (03-19-25)

### Patch Changes

- 9c2f191: add support page and faq section, add my account page, add more examples of override restaurants (chipotle / qdoba)

## 0.2.0 (03-18-25)

### Minor Changes

- f4de703: update auth'd routes to use bearer token instead of passing in user id; standardize param convention to camel case
- 4d5e293: feat: vercel analytics
- f47f8c8: destroy the mapping utility from the web app for now; replace the app route with a dev debbuger; update the api routes to now all use the correct google maps apis; standardize caching approach
- 0e6f1a4: ## Logging System Improvements

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

- 8dc6139: ## API Documentation Improvements

  - Replaced "coming soon" documentation page with comprehensive API documentation
  - Created Markdoc components for rendering API documentation
  - Added documentation for Places API endpoints (nearby, details, photos)
  - Implemented dynamic routing for API documentation pages
  - Added support for custom Markdoc tags (callout, endpoint, parameter, response, code)
  - Created a custom Markdoc component for consistent rendering across the application
  - Updated documentation to reflect actual response types from the API handlers
  - Enhanced documentation with detailed information about each API endpoint
  - Improved styling and navigation for the documentation pages

  Added Markdoc integration for comprehensive API documentation.

  - Replaced the "coming soon" docs page with detailed API documentation
  - Created Markdoc components for rendering API documentation (callout, endpoint, parameter, response, code)
  - Added extensive documentation for the Places API endpoints:
    - Nearby Places API with detailed parameter explanations and examples
    - Place Details API with comprehensive response structure and usage examples
    - Place Photos API with implementation notes and gallery examples
  - Implemented dynamic routing for API documentation pages
  - Enhanced documentation UI with:
    - Improved layout and styling for better readability
    - Navigation cards for quick access to API endpoints
    - Breadcrumb navigation for better wayfinding
    - Related documentation links for easier discovery
    - Responsive design for all screen sizes
  - Added detailed code examples for each API endpoint
  - Included implementation notes and best practices for API usage

- f0e30e9: kill nearby endpoint; replace it with search endpoint
- 7845b19: clean up return structure from api; add places / favorites models; tie them into user model; add ability to toggle / retrieve favorite status on web app;
- 1900c18: update admin app to make add user profile section
- f4de703: add user sync endpoint for client to hit when a new user has been created who has local data for ratings or favorites
- f4de703: add updated at fields to favorite and rating schema

### Patch Changes

- f47f8c8: Removed Swagger references and fixed unused imports.
  - Removed Swagger references from comments and documentation
  - Migrated from lodash to lodash-es for better bundle size
  - Fixed unused imports and variables
- df5fc03: fix issue where favoriting endpoint was not reading place_id param passed by ios app
- 7b57c64: move what was previously /app to /admin; new nicer layout; make things simpler; remove makedoc;
- 0e6f1a4: ## Fix App Page Hydration Error

  Fixed a React hydration error in the app page component that was causing client/server rendering mismatches with feature flag controlled content.

  - Refactored the app page to use a client-side only wrapper component
  - Implemented Suspense to properly handle the rendering of feature flag dependent content
  - Added a loading fallback for better user experience during hydration
  - Separated the main AppPage component from the content implementation
  - Ensured consistent rendering between server and client for the app page
  - Prevented hydration errors by using proper client-side rendering patterns

  This fix ensures a seamless user experience without the console errors that were previously occurring during the initial page load, particularly with the feature flag controlled app page content.

- 9adc94f: add clean script + add react-use library
- f47f8c8: Optimized tree shaking and dependencies.
  - Added webpack configuration to improve tree shaking
  - Configured webpack to alias lodash to lodash-es for better tree shaking
  - Removed unused dependencies (@react-google-maps/api, immer, react-hook-form)
  - Enabled proper tree shaking with usedExports and concatenateModules
- f47f8c8: Removed unused code from the codebase.
  - Deleted unused Shimmer component
  - Deleted unused Form component
  - Removed unused exports from DropdownMenu component
  - Removed unused loading spinner variants (FullScreenLoader, MapLoader, EmojiSelectorLoader)
  - Added JSDoc comments to remaining components
- c291f40: fix: geobounds to use circle / radius insead of rectangle / buffer. update user query to require user id query param
- 6272426: fix emoji matching logic; make it more robust and give it tie-breaking logic
- 532e417: remove connection pooling
- cae291e: simplify client admin app to no longer require dynamic page + use new bearer token convention
- a7783c6: fix: bug where we were returning more than specified limit if we had a cache hit
