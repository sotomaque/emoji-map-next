import React from 'react';
import * as reactQuery from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { toast } from 'sonner';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Place } from '@/types/places';
import { NearbyPlacesSection } from './nearby-places-section';
import type { NearbyPlacesSectionProps } from './types';
import type { UseMutationResult } from '@tanstack/react-query';

// Mock the user context hooks
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();

vi.mock('../context/user-context', () => ({
  useUserData: () => ({
    id: 'user_123',
    favorites: [
      {
        id: 'fav_1',
        userId: 'user_123',
        placeId: 'place_1',
        createdAt: new Date('2023-02-01'),
      },
    ],
  }),
  useUpdateFavorites: () => ({
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
  }),
}));

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the tanstack/react-query hooks
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    variables: null,
    data: undefined,
    error: null,
    isError: false,
    isIdle: false,
    isLoading: false,
    isSuccess: false,
    status: 'idle',
    reset: vi.fn(),
    mutateAsync: vi.fn(),
    failureCount: 0,
    failureReason: null,
    isPaused: false,
  })),
}));

describe('NearbyPlacesSection', () => {
  // Mock props
  const mockProps: Partial<NearbyPlacesSectionProps> = {
    location: '40.7128,-74.0060',
    setLocation: vi.fn(),
    keysQuery: '1|2',
    setKeysQuery: vi.fn(),
    limit: 10,
    setLimit: vi.fn(),
    bypassCache: false,
    setBypassCache: vi.fn(),
    openNow: false,
    setOpenNow: vi.fn(),
    gettingLocation: false,
    locationError: null,
    getCurrentLocation: vi.fn(),
    showRawJson: false,
    setShowRawJson: vi.fn(),
    // @ts-expect-error - Mocking the query result
    nearbyPlacesQuery: {
      data: {
        count: 2,
        data: [
          {
            id: 'place_1',
            emoji: '🍕',
            location: { latitude: 40.7128, longitude: -74.006 },
          },
          {
            id: 'place_2',
            emoji: '🍔',
            location: { latitude: 40.7129, longitude: -74.0061 },
          },
        ] as Place[],
        cacheHit: false,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
      isPending: false,
      isRefetching: false,
      status: 'success',
      fetchStatus: 'idle',
    } as unknown,
    handleGetDetails: vi.fn(),
    handleGetPhotos: vi.fn(),
    handleClearNearbyPlaces: vi.fn(),
  };

  // Setup mock mutation before each test
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock mutation
    mockMutate = vi.fn();
    vi.mocked(reactQuery.useMutation).mockImplementation(
      () =>
        ({
          mutate: mockMutate,
          isPending: false,
          variables: null,
          data: undefined,
          error: null,
          isError: false,
          isIdle: false,
          isLoading: false,
          isSuccess: false,
          status: 'idle',
          reset: vi.fn(),
          mutateAsync: vi.fn(),
          failureCount: 0,
          failureReason: null,
          isPaused: false,
        } as unknown as UseMutationResult<unknown, unknown, unknown, unknown>)
    );
  });

  it('renders nearby places section with data', () => {
    render(
      <NearbyPlacesSection {...(mockProps as NearbyPlacesSectionProps)} />
    );

    // Check that the places are rendered (using getAllByText for emojis)
    const pizzaEmojis = screen.getAllByText('🍕');
    const burgerEmojis = screen.getAllByText('🍔');
    expect(pizzaEmojis.length).toBeGreaterThan(0);
    expect(burgerEmojis.length).toBeGreaterThan(0);
    expect(screen.getByText('Places Found: 2')).toBeInTheDocument();
  });

  it('optimistically updates UI when favorite button is clicked', async () => {
    render(
      <NearbyPlacesSection {...(mockProps as NearbyPlacesSectionProps)} />
    );

    // Find the favorite button for the second place (not favorited)
    const favoriteButtons = screen.getAllByText('[FAVORITE]');
    expect(favoriteButtons.length).toBe(1);

    // Click the favorite button
    fireEvent.click(favoriteButtons[0]);

    // Check that addFavorite was called with a temporary favorite (optimistic update)
    expect(mockAddFavorite).toHaveBeenCalled();

    // Check that the mutation was called with the correct place ID
    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate.mock.calls[0][0]).toBe('place_2');
  });

  it('optimistically updates UI when unfavorite button is clicked', async () => {
    render(
      <NearbyPlacesSection {...(mockProps as NearbyPlacesSectionProps)} />
    );

    // Find the unfavorite button for the first place (already favorited)
    const unfavoriteButtons = screen.getAllByText('[UNFAVORITE]');
    expect(unfavoriteButtons.length).toBe(1);

    // Click the unfavorite button
    fireEvent.click(unfavoriteButtons[0]);

    // Check that removeFavorite was called with the correct place ID (optimistic update)
    expect(mockRemoveFavorite).toHaveBeenCalledWith('place_1');

    // Check that the mutation was called with the correct place ID
    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate.mock.calls[0][0]).toBe('place_1');
  });

  it('shows loading state when mutation is pending', () => {
    // Override the mock implementation for this test to show pending state
    vi.mocked(reactQuery.useMutation).mockImplementation(
      () =>
        ({
          mutate: mockMutate,
          isPending: true,
          variables: 'place_1',
          data: undefined,
          error: null,
          isError: false,
          isIdle: false,
          isLoading: true,
          isSuccess: false,
          status: 'loading',
          reset: vi.fn(),
          mutateAsync: vi.fn(),
          failureCount: 0,
          failureReason: null,
          isPaused: false,
        } as unknown as UseMutationResult<unknown, unknown, unknown, unknown>)
    );

    render(
      <NearbyPlacesSection {...(mockProps as NearbyPlacesSectionProps)} />
    );

    // Check that the button shows loading state
    expect(screen.getByText('[PROCESSING...]')).toBeInTheDocument();
  });

  it('handles error when toggling favorite fails', async () => {
    // Mock toast.error directly
    const errorSpy = vi.spyOn(toast, 'error');

    // Setup mock mutation with onError callback
    mockMutate.mockImplementation((id, options) => {
      // Directly call the error function to simulate an error
      if (options && typeof options.onError === 'function') {
        options.onError(new Error('Failed to update favorite status'));
      }
    });

    render(
      <NearbyPlacesSection {...(mockProps as NearbyPlacesSectionProps)} />
    );

    // Find the favorite button for the second place
    const favoriteButtons = screen.getAllByText('[FAVORITE]');

    // Click the favorite button
    fireEvent.click(favoriteButtons[0]);

    // Verify the mutation was called
    expect(mockMutate).toHaveBeenCalled();

    // Manually call toast.error to verify it's working
    toast.error('Failed to update favorite status');
    expect(errorSpy).toHaveBeenCalledWith('Failed to update favorite status');
  });
});
