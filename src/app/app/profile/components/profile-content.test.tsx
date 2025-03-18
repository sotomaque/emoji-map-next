import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileContent } from './profile-content';
import type { Favorite, User } from '@prisma/client';

describe('ProfileContent', () => {
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

  const mockUser: User & { favorites?: Favorite[] } = {
    id: 'user_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    favorites: mockFavorites,
  };

  it('renders user profile information', () => {
    render(<ProfileContent user={mockUser} />);

    // Check for profile elements
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByAltText("Test's profile")).toBeInTheDocument();

    // Check for Member Since section
    expect(screen.getByText('Member Since')).toBeInTheDocument();

    // Check for User ID section
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('user_123')).toBeInTheDocument();

    // Check for Last Updated section
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
  });

  it('handles missing optional user data', () => {
    const userWithMissingData = {
      ...mockUser,
      firstName: null,
      lastName: null,
      username: null,
      imageUrl: null,
      favorites: [],
    };

    render(<ProfileContent user={userWithMissingData} />);

    // Check that the component renders without errors
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();

    // Username should not be rendered
    expect(screen.queryByText('@testuser')).not.toBeInTheDocument();

    // Check for fallback avatar (first letter of email)
    const avatarDiv = screen.getByText('t');
    expect(avatarDiv).toBeInTheDocument();
    expect(avatarDiv.classList.contains('rounded-full')).toBe(true);
  });
});
