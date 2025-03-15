import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProfileLayout from '../layout';

describe('ProfileLayout', () => {
  // Set a fixed date for all tests
  const fixedDate = new Date('2023-05-15T12:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();

    // Use fake timers and set a fixed system time
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it('renders children correctly', async () => {
    const result = await ProfileLayout({ children: <div>Test</div> });

    // Check that the result is a div with the correct class and children
    expect(result.type).toBe('div');
    expect(result.props.className).toBe('profile-layout');
    expect(result.props.children).toEqual(<div>Test</div>);
  });
});
