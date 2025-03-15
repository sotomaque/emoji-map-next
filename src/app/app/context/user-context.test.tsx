import React from 'react';
import { render, renderHook, act, fireEvent } from '@testing-library/react';
import { useMount } from 'react-use';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  UserProvider,
  useUser,
  useUserData,
  useUpdateFavorites,
} from './user-context';
import type { User, Favorite } from '@prisma/client';

describe('UserContext', () => {
  // Mock user data
  let mockUser: User & { favorites?: Favorite[] };

  beforeEach(() => {
    // Reset mockUser before each test
    mockUser = {
      id: 'user_123',
      clerkId: 'clerk_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      imageUrl: 'https://example.com/image.jpg',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
      favorites: [
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
      ],
    };
  });

  // Test component that uses the useUser hook
  const TestComponent = () => {
    const { userData } = useUser();
    return (
      <div>
        <div data-testid='user-id'>{userData?.id}</div>
        <div data-testid='user-email'>{userData?.email}</div>
        <div data-testid='favorites-count'>
          {userData?.favorites?.length || 0}
        </div>
      </div>
    );
  };

  it('provides user data to children', () => {
    const { getByTestId } = render(
      <UserProvider user={mockUser}>
        <TestComponent />
      </UserProvider>
    );

    expect(getByTestId('user-id')).toHaveTextContent('user_123');
    expect(getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(getByTestId('favorites-count')).toHaveTextContent('2');
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

  it('updates user data when updateUser is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider user={mockUser}>{children}</UserProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    // Update the user's email
    act(() => {
      result.current.updateUser({ email: 'updated@example.com' });
    });

    // Check that the email was updated
    expect(result.current.userData?.email).toBe('updated@example.com');

    // Check that other properties were preserved
    expect(result.current.userData?.id).toBe('user_123');
    expect(result.current.userData?.favorites?.length).toBe(2);
  });

  it('useUserData hook returns user data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider user={mockUser}>{children}</UserProvider>
    );

    const { result } = renderHook(() => useUserData(), { wrapper });

    // Check that the user data is returned
    expect(result.current.id).toBe('user_123');
    expect(result.current.email).toBe('test@example.com');
    expect(result.current.favorites?.length).toBe(2);
  });

  it('useUserData hook throws error when user data is not available', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider user={null}>{children}</UserProvider>
    );

    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useUserData(), { wrapper });
    }).toThrow('User data is not available');

    // Restore console.error
    console.error = originalConsoleError;
  });

  describe('useUpdateFavorites', () => {
    // Create a component that uses the hooks and exposes methods to test
    const TestFavoritesComponent = ({ onMount }: { onMount?: () => void }) => {
      const { userData } = useUser();
      const { addFavorite, removeFavorite } = useUpdateFavorites();

      // Call onMount if provided
      if (onMount) {
        onMount();
      }

      return (
        <div>
          <div data-testid='favorites-count'>
            {userData?.favorites?.length || 0}
          </div>
          <button
            data-testid='add-favorite'
            onClick={() => {
              const newFavorite: Favorite = {
                id: 'fav_3',
                userId: 'user_123',
                placeId: 'place_3',
                createdAt: new Date('2023-03-01'),
              };
              addFavorite(newFavorite);
            }}
          >
            Add Favorite
          </button>
          <button
            data-testid='remove-favorite'
            onClick={() => removeFavorite('place_1')}
          >
            Remove Favorite
          </button>
        </div>
      );
    };

    it('adds a favorite', () => {
      const { getByTestId } = render(
        <UserProvider user={mockUser}>
          <TestFavoritesComponent />
        </UserProvider>
      );

      // Check initial count
      expect(getByTestId('favorites-count')).toHaveTextContent('2');

      // Click the add button
      fireEvent.click(getByTestId('add-favorite'));

      // Check updated count
      expect(getByTestId('favorites-count')).toHaveTextContent('3');
    });

    it('removes a favorite', () => {
      const { getByTestId } = render(
        <UserProvider user={mockUser}>
          <TestFavoritesComponent />
        </UserProvider>
      );

      // Check initial count
      expect(getByTestId('favorites-count')).toHaveTextContent('2');

      // Click the remove button
      fireEvent.click(getByTestId('remove-favorite'));

      // Check updated count
      expect(getByTestId('favorites-count')).toHaveTextContent('1');
    });

    it('does not add a duplicate favorite', () => {
      // Create a test component that adds a duplicate on mount
      const TestDuplicateComponent = () => {
        const { userData } = useUser();
        const { addFavorite } = useUpdateFavorites();

        // Add a duplicate favorite on mount
        useMount(() => {
          const existingFavorite: Favorite = {
            id: 'fav_1',
            userId: 'user_123',
            placeId: 'place_1',
            createdAt: new Date('2023-02-01'),
          };
          addFavorite(existingFavorite);
        });

        return (
          <div data-testid='favorites-count'>
            {userData?.favorites?.length || 0}
          </div>
        );
      };

      const { getByTestId } = render(
        <UserProvider user={mockUser}>
          <TestDuplicateComponent />
        </UserProvider>
      );

      // Count should still be 2
      expect(getByTestId('favorites-count')).toHaveTextContent('2');
    });
  });
});
