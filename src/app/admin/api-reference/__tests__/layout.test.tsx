import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLayout from '../layout';

// Mock Next.js redirect
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Clerk's currentUser
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

describe('AdminLayout', () => {
  const mockChildren = <div data-testid='child-content'>Test Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is an admin', async () => {
    // Mock an admin user
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      publicMetadata: {
        admin: true,
      },
    });

    const { findByTestId } = render(
      await AdminLayout({ children: mockChildren })
    );

    expect(await findByTestId('child-content')).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects when user is not an admin', async () => {
    // Mock a non-admin user
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      publicMetadata: {
        admin: false,
      },
    });

    await AdminLayout({ children: mockChildren });

    expect(redirect).toHaveBeenCalledWith('/admin');
  });

  it('redirects when user is null', async () => {
    // Mock no user
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      null
    );

    await AdminLayout({ children: mockChildren });

    expect(redirect).toHaveBeenCalledWith('/admin');
  });

  it('redirects when admin metadata is not present', async () => {
    // Mock user with no admin metadata
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      publicMetadata: {},
    });

    await AdminLayout({ children: mockChildren });

    expect(redirect).toHaveBeenCalledWith('/admin');
  });
});
