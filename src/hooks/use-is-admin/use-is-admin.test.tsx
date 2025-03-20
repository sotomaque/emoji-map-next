import { useUser } from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIsAdmin } from './use-is-admin';
import type { UseUserReturn } from '@clerk/types';

// Mock @clerk/nextjs
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

describe('useIsAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when user has admin metadata', () => {
    // Setup mock user with admin: true
    vi.mocked(useUser).mockReturnValue({
      user: {
        publicMetadata: {
          admin: true,
        },
      },
    } as unknown as UseUserReturn);

    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(true);
  });

  it('returns false when user does not have admin metadata', () => {
    // Setup mock user with no admin metadata
    vi.mocked(useUser).mockReturnValue({
      user: {
        publicMetadata: {},
      },
    } as unknown as UseUserReturn);

    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);
  });

  it('returns false when user is null', () => {
    // Setup mock with no user
    vi.mocked(useUser).mockReturnValue({
      user: null,
    } as unknown as UseUserReturn);

    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);
  });

  it('returns false when publicMetadata is undefined', () => {
    // Setup mock with user but no publicMetadata
    vi.mocked(useUser).mockReturnValue({
      user: {},
    } as unknown as UseUserReturn);

    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);
  });
});
