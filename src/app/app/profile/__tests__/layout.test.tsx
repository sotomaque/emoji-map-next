import { redirect } from 'next/navigation';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCurrentUser } from '../actions';
import ProfileLayout from '../layout';
import { UserProvider } from '../context/user-context';

// Mock dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock the server action
vi.mock('../actions', () => ({
  getCurrentUser: vi.fn(),
}));

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

  it('redirects to /app when user is not found', async () => {
    // Mock getCurrentUser to return null
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);

    await ProfileLayout({ children: <div>Test</div> });

    expect(redirect).toHaveBeenCalledWith('/app');
  });

  it('renders children with user data when user is found', async () => {
    // Mock user data
    const mockUser = {
      id: 'user_123',
      clerkId: 'clerk_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      imageUrl: 'https://example.com/image.jpg',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };

    // Mock getCurrentUser to return user data
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);

    const result = await ProfileLayout({ children: <div>Test</div> });

    expect(redirect).not.toHaveBeenCalled();

    // Check that the result contains a UserProvider with the user data
    expect(result.props.children).toEqual(
      <UserProvider user={mockUser}>
        <div>Test</div>
      </UserProvider>
    );
  });
}); 