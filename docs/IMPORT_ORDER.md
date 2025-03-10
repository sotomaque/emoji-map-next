# Import Order Guidelines

This project uses ESLint with the `import` plugin to enforce a consistent import order in all TypeScript and JavaScript files. Following these guidelines helps maintain code readability and consistency across the codebase.

## Import Order

Imports should be ordered as follows:

1. **Built-in Node.js modules** (e.g., `path`, `fs`)
2. **React and Next.js imports** (e.g., `react`, `next/router`)
3. **External dependencies** (third-party packages from node_modules)
4. **Internal modules** (imports using the `@/` alias)
5. **Parent, sibling, and index imports** (imports using `../`, `./`, or from the same directory)
6. **Type imports** (TypeScript type imports)

## Rules

- Imports should be grouped without blank lines between each group
- Imports within each group should be alphabetically sorted
- Always use the `@/` alias for imports from the project's source directory
- Type imports should be at the bottom of the import list

## Examples

### Good Example

```typescript
// Built-in modules
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';

// External dependencies
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

// Internal modules (using alias)
import { Button } from '@/components/ui/button';
import { useFiltersStore } from '@/store/useFiltersStore';
import { formatDate } from '@/utils/date';

// Parent/sibling imports
import { SomeComponent } from '../some-component';
import { AnotherComponent } from './another-component';

// Type imports
import type { User } from '@/types/user';
```

### Bad Example

```typescript
import { formatDate } from '@/utils/date';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { SomeComponent } from '../some-component';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { AnotherComponent } from './another-component';
import { useFiltersStore } from '@/store/useFiltersStore';
```

## Automatic Fixing

You can automatically fix import order issues by running:

```bash
pnpm lint:fix
```

This will reorder imports according to the rules defined in the ESLint configuration. 