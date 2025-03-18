import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useUserData } from '../../context/user-context';
import ProfilePage from '../page';
import type { User, Favorite, Rating } from '@prisma/client';

// Mock the user context
vi.mock('../../context/user-context', () => ({
  useUserData: vi.fn(),
}));

// Mock ProfileContent component (named export in actual code)
vi.mock('../components/profile-content', () => {
  return {
    __esModule: true,
    ProfileContent: ({ user }: { user: User }) => (
      <div data-testid='profile-content'>
        <div>
          Name: {user.firstName} {user.lastName}
        </div>
        <div>Email: {user.email}</div>
        {user.username && <div>Username: @{user.username}</div>}
      </div>
    ),
  };
});

// Mock FavoritesTable component (named export in actual code)
vi.mock('../components/favorites-table', () => {
  return {
    __esModule: true,
    FavoritesTable: ({ favorites }: { favorites?: Favorite[] }) => (
      <div data-testid='favorites-table'>
        <div>Favorites count: {favorites?.length || 0}</div>
      </div>
    ),
  };
});

// Mock RatingsTable component (named export in actual code)
vi.mock('../components/ratings-table', () => {
  return {
    __esModule: true,
    RatingsTable: ({ ratings }: { ratings?: Rating[] }) => (
      <div data-testid='ratings-table'>
        <div>Ratings count: {ratings?.length || 0}</div>
      </div>
    ),
  };
});

// Mock PlaceDetails component (named export in actual code)
vi.mock('../components/place-details', () => {
  return {
    __esModule: true,
    PlaceDetails: ({ placeId }: { placeId: string }) => (
      <div data-testid='place-details'>
        <div>Place ID: {placeId}</div>
      </div>
    ),
  };
});

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

  it('renders the profile page with user data, favorites and ratings', () => {
    // Mock favorites
    const mockFavorites: Favorite[] = [
      {
        id: 'fav_1',
        userId: 'user_123',
        placeId: 'place_1',
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-01'),
      },
      {
        id: 'fav_2',
        userId: 'user_123',
        placeId: 'place_2',
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date('2023-02-15'),
      },
    ];

    // Mock ratings
    const mockRatings: Rating[] = [
      {
        id: 'rating_1',
        userId: 'user_123',
        placeId: 'place_1',
        rating: 4,
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-01'),
      },
    ];

    // Mock user data
    const mockUser: User & { favorites?: Favorite[]; ratings?: Rating[] } = {
      id: 'user_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      imageUrl: 'https://example.com/image.jpg',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
      favorites: mockFavorites,
      ratings: mockRatings,
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

    // Check for the ratings table component
    expect(screen.getByTestId('ratings-table')).toBeInTheDocument();
    expect(screen.getByText('Ratings count: 1')).toBeInTheDocument();

    // Check for the back button
    const backButton = screen.getByText('Back to Dashboard');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/app');
  });
});
