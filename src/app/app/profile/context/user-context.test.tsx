import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { UserProvider, useUser } from './user-context';
import type { Favorite } from '@prisma/client';

// Create a test component that uses the useUser hook
const TestComponent = () => {
  const user = useUser();
  return (
    <div>
      <div data-testid="user-id">{user.id}</div>
      <div data-testid="user-email">{user.email}</div>
      <div data-testid="favorites-count">{user.favorites?.length || 0}</div>
    </div>
  );
};

describe('UserContext', () => {
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

  it('provides user data to children', () => {
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

    render(
      <UserProvider user={mockUser}>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('user-id')).toHaveTextContent('user_123');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('favorites-count')).toHaveTextContent('2');
  });

  it('throws an error when useUser is used outside of UserProvider', () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Expect rendering TestComponent without UserProvider to throw an error
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUser must be used within a UserProvider');

    // Restore console.error
    console.error = originalConsoleError;
  });
}); 