---
"web": patch
---

Optimized tree shaking and dependencies.
- Added webpack configuration to improve tree shaking
- Configured webpack to alias lodash to lodash-es for better tree shaking
- Removed unused dependencies (@react-google-maps/api, immer, react-hook-form)
- Enabled proper tree shaking with usedExports and concatenateModules 