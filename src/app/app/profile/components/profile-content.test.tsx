import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProfileContent from './profile-content';
import type { Favorite } from '@prisma/client';

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
    },
    {
      id: 'fav_2',
      userId: 'user_123',
      placeId: 'place_2',
      createdAt: new Date('2023-02-15'),
    },
  ];

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

  it('renders user profile information', () => {
    render(<ProfileContent user={mockUser} />);

    // Check for profile elements
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByAltText("Test's profile")).toBeInTheDocument();

    // Check for Member Since section with the expected date format
    expect(screen.getByText('Member Since')).toBeInTheDocument();

    // The date format is 12/31/2022 (based on the actual output)
    expect(screen.getByText('12/31/2022')).toBeInTheDocument();
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

    // Username section should not be rendered
    expect(screen.queryByText('@testuser')).not.toBeInTheDocument();
  });
}); 