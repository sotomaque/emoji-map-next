import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';

// Mock Statsig's useGateValue hook globally
vi.mock('@statsig/react-bindings', () => ({
  useGateValue: vi.fn().mockReturnValue(false),
  LogLevel: {
    Debug: 'debug',
    Info: 'info',
    Warn: 'warn',
    Error: 'error',
  },
  StatsigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});

// MSW server setup for API mocking
export const createMockServer = (...handlers: RequestHandler[]) => {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
};
