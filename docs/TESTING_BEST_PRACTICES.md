# Testing Best Practices

## Overview

This document outlines the best practices for testing in the Emoji Map project. It covers how to handle external API calls, how to use mocks, and how to structure tests.

## Handling External API Calls

When testing components or functions that make external API calls, it's important to mock these calls to prevent actual network requests during tests. This makes tests faster, more reliable, and independent of external services.

### Using MSW (Mock Service Worker)

We use [MSW (Mock Service Worker)](https://mswjs.io/) to intercept and mock network requests. MSW allows us to define handlers for specific API endpoints and return mock responses.

#### Setup

The global MSW setup is defined in `src/__tests__/setup.ts`. This file sets up the MSW server and defines default handlers for common API endpoints.

```typescript
// Example of MSW setup in setup.ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  // Define handlers for external API calls
  http.get('https://api.example.com/data', () => {
    return HttpResponse.json({ data: 'mocked data' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Test-Specific Handlers

For test-specific handlers, you can use the `server.use()` method to override the default handlers:

```typescript
import { http, HttpResponse } from 'msw';

// In your test file
beforeEach(() => {
  server.use(
    http.get('https://api.example.com/data', () => {
      return HttpResponse.json({ data: 'test-specific data' });
    })
  );
});
```

### Using Fixtures

For complex API responses, we use fixtures to store mock data. Fixtures are stored in the `src/__fixtures__` directory and are organized by API provider.

```typescript
// Example of using fixtures
import mockResponse from '@/__fixtures__/googe/places-new/response.json';

// In your MSW handler
http.get('https://api.example.com/data', () => {
  return HttpResponse.json(mockResponse);
});
```

## Mocking Dependencies

### Mocking Modules

Use Vitest's `vi.mock()` to mock modules:

```typescript
// Mock a module
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));
```

### Mocking Functions

Use Vitest's `vi.fn()` to mock functions:

```typescript
// Mock a function
const mockFunction = vi.fn().mockReturnValue('mocked value');
```

## Test Structure

### Unit Tests

Unit tests should focus on testing a single unit of code in isolation. Mock all dependencies and external calls.

```typescript
describe('MyComponent', () => {
  it('should render correctly', () => {
    // Test component rendering
  });

  it('should handle user interaction', async () => {
    // Test user interaction
  });
});
```

### Integration Tests

Integration tests should focus on testing how multiple units work together. Mock external dependencies but allow internal dependencies to interact.

```typescript
describe('API Integration', () => {
  it('should fetch and process data', async () => {
    // Test API integration
  });
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent of others. Avoid shared state between tests.
2. **Mock External Dependencies**: Always mock external dependencies like API calls, databases, etc.
3. **Use Fixtures**: Use fixtures for complex mock data to keep tests clean and maintainable.
4. **Test Edge Cases**: Test both happy paths and edge cases, including error handling.
5. **Keep Tests Fast**: Tests should run quickly to provide fast feedback during development.
6. **Use Descriptive Test Names**: Test names should clearly describe what is being tested.
7. **Follow AAA Pattern**: Arrange, Act, Assert - structure tests to set up conditions, perform actions, and verify results.

## Example Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked data' }),
}));

describe('MyComponent', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should render loading state initially', () => {
    render(<MyComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display data when loaded', async () => {
    render(<MyComponent />);
    // Wait for data to load
    expect(await screen.findByText('mocked data')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    // Wait for data to load
    await screen.findByText('mocked data');
    
    // Interact with component
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    
    // Verify result
    expect(screen.getByText('Button clicked')).toBeInTheDocument();
  });
});
```

## Conclusion

Following these best practices will help ensure that tests are reliable, maintainable, and provide value to the development process. Remember that tests are an investment in the quality and maintainability of the codebase. 