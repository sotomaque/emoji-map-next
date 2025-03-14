---
"web": patch
---

## Fix App Page Hydration Error

Fixed a React hydration error in the app page component that was causing client/server rendering mismatches with feature flag controlled content.

- Refactored the app page to use a client-side only wrapper component
- Implemented Suspense to properly handle the rendering of feature flag dependent content
- Added a loading fallback for better user experience during hydration
- Separated the main AppPage component from the content implementation
- Ensured consistent rendering between server and client for the app page
- Prevented hydration errors by using proper client-side rendering patterns

This fix ensures a seamless user experience without the console errors that were previously occurring during the initial page load, particularly with the feature flag controlled app page content. 