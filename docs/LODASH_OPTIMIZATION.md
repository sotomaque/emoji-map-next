# Lodash Optimization Guide

This project uses optimized Lodash imports to reduce bundle size and improve performance. This document explains the optimization strategy and provides guidelines for using Lodash in the codebase.

## Optimization Strategy

We use two main strategies to optimize Lodash imports:

1. **ESLint Rules**: We enforce importing specific Lodash functions instead of the entire library.
2. **Webpack Configuration**: We use `lodash-es` for better tree shaking in client bundles.

## Import Guidelines

### ✅ Correct Way to Import Lodash Functions

Import specific functions directly from their modules:

```typescript
// Good: Import specific functions
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import isEmpty from 'lodash/isEmpty';

// Also good: Import from lodash-es (automatically aliased in webpack config)
import { debounce, throttle, isEmpty } from 'lodash-es';
```

### ❌ Incorrect Ways to Import Lodash

Avoid importing the entire Lodash library:

```typescript
// Bad: Imports the entire Lodash library
import _ from 'lodash';
_.debounce(myFunction, 300);

// Bad: Destructuring from the main package
import { debounce, throttle } from 'lodash';
```

## Benefits

- **Smaller Bundle Size**: Only the functions you actually use are included in the bundle.
- **Better Tree Shaking**: The ES modules format allows better dead code elimination.
- **Improved Performance**: Smaller bundles lead to faster load times and better performance.

## Bundle Size Comparison

| Import Method | Approximate Bundle Size Impact |
|---------------|--------------------------------|
| `import _ from 'lodash'` | ~70KB (minified + gzipped) |
| `import { debounce } from 'lodash'` | ~70KB (minified + gzipped) |
| `import debounce from 'lodash/debounce'` | ~2KB (minified + gzipped) |
| `import { debounce } from 'lodash-es'` | ~2KB (minified + gzipped) |

## Automatic Enforcement

Our ESLint configuration will automatically flag incorrect Lodash imports. You can fix these issues by running:

```bash
pnpm lint:fix
```

## Common Lodash Functions and Their Import Paths

Here are some commonly used Lodash functions and their import paths:

```typescript
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import set from 'lodash/set';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import uniq from 'lodash/uniq';
import groupBy from 'lodash/groupBy';
```

## 1. Individual Function Imports

Instead of importing the entire Lodash library, we now import only the specific functions we need:

```javascript
// Before
import _ from 'lodash';
const result = _.map(items, item => item.id);

// After
import { map } from 'lodash';
const result = map(items, item => item.id);
```

This approach allows for better tree shaking, as the bundler can exclude unused Lodash functions from the final bundle.

## 2. Using lodash-es for Better Tree Shaking

We've added `lodash-es` as a dependency, which provides ES modules for better tree shaking:

```javascript
// Before
import { map } from 'lodash';

// After
import { map } from 'lodash-es';
```

Additionally, we've configured webpack to alias `lodash` to `lodash-es` for client bundles:

```javascript
// In next.config.ts
webpack: (config) => {
  if (!isServer) {
    config.resolve.alias = {
      ...config.resolve.alias,
      lodash: 'lodash-es',
    };
  }
  return config;
}
```

This ensures that even if a module imports from `lodash`, it will use the ES modules version for better tree shaking.

## 3. Replacing Lodash Chaining

We've replaced Lodash chaining with direct function calls:

```javascript
// Before
const processedPlaces = _(data.places)
  .map(place => createSimplifiedPlace(place))
  .filter(place => place.id !== undefined)
  .value();

// After
const processedPlaces = filter(
  map(data.places, place => createSimplifiedPlace(place)),
  place => place.id !== undefined
);
```

This approach is more readable and allows for better tree shaking.

## 4. Measuring Impact

To measure the impact of these optimizations, run:

```bash
pnpm analyze
```

This will generate a bundle analysis report that shows the size of each module in the bundle.

## 5. Script to Convert Lodash Imports

You can use the following script to automatically convert your Lodash imports:

```bash
#!/bin/bash
# convert-lodash-imports.sh

# Find all TypeScript and JavaScript files
find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read -r file; do
  # Replace full lodash import with lodash-es
  sed -i '' 's/import _ from "lodash";/import _ from "lodash-es";/g' "$file"
  sed -i '' "s/import _ from 'lodash';/import _ from 'lodash-es';/g" "$file"
  
  # Replace named imports from lodash with lodash-es
  sed -i '' 's/import {/import {/g' "$file"
  sed -i '' 's/} from "lodash";/} from "lodash-es";/g' "$file"
  sed -i '' "s/} from 'lodash';/} from 'lodash-es';/g" "$file"
  
  echo "Processed $file"
done

echo "Conversion complete!"
```

Make the script executable and run it:

```bash
chmod +x convert-lodash-imports.sh
./convert-lodash-imports.sh
```

This will convert all Lodash imports in your codebase to use `lodash-es` instead. 