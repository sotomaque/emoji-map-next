import { auth } from '@clerk/nextjs/server';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from '@/env';
import AppLayout from '../layout';

// Create a proper type for the auth return value
type MockAuthReturn = {
  getToken: () => Promise<string | null>;
  // Add other properties that might be needed
};

// Mock dependencies
vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='signed-in'>{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='signed-out'>{children}</div>
  ),
}));

// Mock clerk auth to return our custom type
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  },
}));

vi.mock('@/components/nav/header/header', () => ({
  Header: ({ showAuth }: { showAuth: boolean }) => (
    <header data-testid='header' data-show-auth={showAuth}>
      Mock Header
    </header>
  ),
}));

vi.mock('../components/auth-required-section', () => ({
  AuthRequiredSection: () => (
    <div data-testid='auth-required'>Auth Required Mock</div>
  ),
}));

vi.mock('../context/user-context', () => ({
  UserProvider: ({
    user,
    token,
    children,
  }: {
    user: {
      id: string;
      [key: string]: unknown;
    };
    token: string;
    children: React.ReactNode;
  }) => (
    <div data-testid='user-provider' data-user-id={user.id} data-token={token}>
      {children}
    </div>
  ),
}));

// Mock global fetch
global.fetch = vi.fn() as unknown as typeof fetch;

describe('AppLayout', () => {
  const mockToken = 'mock-token';
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'http://example.com/image.jpg',
    username: 'testuser',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorites: [],
    ratings: [],
  };

  const mockUserResponse = {
    user: mockUser,
    status: 200,
  };

  const mockChildren = <div data-testid='children'>Test Children</div>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Fix the type issues by mocking auth as a function that returns a promise
    // This matches how Next.js expects auth() to be called
    (auth as unknown as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve({
        getToken: () => Promise.resolve(mockToken),
      } as MockAuthReturn)
    );

    // Default fetch mock to return a successful response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockUserResponse),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render the authenticated layout when user is logged in', async () => {
    const layout = await AppLayout({ children: mockChildren });
    render(layout);

    // Check auth and API calls
    expect(auth).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      `${env.NEXT_PUBLIC_SITE_URL}/api/user`,
      {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      }
    );

    // Check that authenticated components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('signed-in')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toHaveAttribute(
      'data-user-id',
      mockUser.id
    );
    expect(screen.getByTestId('user-provider')).toHaveAttribute(
      'data-token',
      mockToken
    );
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('should render the unauthorized layout when no token is available', async () => {
    // Mock auth to return no token
    (auth as unknown as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve({
        getToken: () => Promise.resolve(null),
      } as MockAuthReturn)
    );

    const layout = await AppLayout({ children: mockChildren });
    render(layout);

    // Check auth call
    expect(auth).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();

    // Check that unauthenticated components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
    expect(screen.queryByTestId('signed-in')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('should render the unauthorized layout when authentication fails', async () => {
    // Mock auth to throw an error
    (auth as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Auth error')
    );

    const layout = await AppLayout({ children: mockChildren });
    render(layout);

    // Check that unauthenticated components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
    expect(screen.queryByTestId('signed-in')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('should render the unauthorized layout when API call fails', async () => {
    // Mock fetch to return an error response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const layout = await AppLayout({ children: mockChildren });
    render(layout);

    // Check auth and API calls
    expect(auth).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();

    // Check that unauthenticated components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
    expect(screen.queryByTestId('signed-in')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('should render the unauthorized layout when API returns invalid data', async () => {
    // Mock fetch to return invalid user data (missing user property)
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: 200 }), // Missing user property
    });

    const layout = await AppLayout({ children: mockChildren });
    render(layout);

    // Check auth and API calls
    expect(auth).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();

    // Check that unauthenticated components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
    expect(screen.queryByTestId('signed-in')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('should render the unauthorized layout when Zod validation fails', async () => {
    // Mock fetch to return data that will fail Zod validation (missing required fields)
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        user: {
          // Missing required fields like id, email, etc.
          favorites: [],
          ratings: [],
        },
        status: 200,
      }),
    });

    const layout = await AppLayout({ children: mockChildren });
    render(layout);

    // Check auth and API calls
    expect(auth).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();

    // Check that unauthenticated components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
    expect(screen.queryByTestId('signed-in')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('should render the unauthorized layout when API call throws', async () => {
    // Mock fetch to throw an error
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    const layout = await AppLayout({ children: mockChildren });
    render(layout);

    // Check auth and API calls
    expect(auth).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();

    // Check that unauthenticated components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
    expect(screen.queryByTestId('signed-in')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });
});
