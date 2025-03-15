import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useUserData } from '../../context/user-context';
import ProfilePage from '../page';
import type { User, Favorite } from '@prisma/client';

// Mock the useUser hook
vi.mock('../../context/user-context', () => ({
  useUser: vi.fn(),
  useUserData: vi.fn(),
}));

// Mock ProfileContent component
vi.mock('../components/profile-content', () => ({
  default: ({ user }: { user: User }) => (
    <div data-testid='profile-content'>
      <div>
        Name: {user.firstName} {user.lastName}
      </div>
      <div>Email: {user.email}</div>
      {user.username && <div>Username: @{user.username}</div>}
    </div>
  ),
}));

// Mock FavoritesTable component
vi.mock('../components/favorites-table', () => ({
  default: ({ favorites }: { favorites?: Favorite[] }) => (
    <div data-testid='favorites-table'>
      <div>Favorites count: {favorites?.length || 0}</div>
    </div>
  ),
}));

describe('ProfilePage', () => {
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

  it('renders the profile page with user data and favorites', () => {
    // Mock favorites
    const mockFavorites: Favorite[] = [
      {
        id: 'fav_1',
        userId: 'user_123',
        placeId: 'place_1',
        createdAt: new Date('2023-02-01'),
      },
      {
        id: 'fav_2',
        userId: 'user_123',
        placeId: 'place_2',
        createdAt: new Date('2023-02-15'),
      },
    ];

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
      favorites: mockFavorites,
    };

    // Mock useUserData to return user data
    (useUserData as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

    render(<ProfilePage />);

    // Check for the heading
    expect(screen.getByText('Your Profile')).toBeInTheDocument();

    // Check for the profile content component
    expect(screen.getByTestId('profile-content')).toBeInTheDocument();

    // Check for the favorites table component
    expect(screen.getByTestId('favorites-table')).toBeInTheDocument();
    expect(screen.getByText('Favorites count: 2')).toBeInTheDocument();

    // Check for the back button
    const backButton = screen.getByText('Back to Dashboard');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/app');
  });
});
