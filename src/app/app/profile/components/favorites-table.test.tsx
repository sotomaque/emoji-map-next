import * as reactQuery from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { toast } from 'sonner';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FavoritesTable from './favorites-table';
import type { Favorite } from '@prisma/client';

// Mock the user context hooks
const mockRemoveFavorite = vi.fn();
const mockAddFavorite = vi.fn();

vi.mock('../../context/user-context', () => ({
  useUserData: () => ({
    id: 'user_123',
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
  }),
  useUpdateFavorites: () => ({
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
  }),
}));

// Define the type for toast options
interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  description?: string;
  action?: ToastAction;
}

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the tanstack/react-query hooks
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
}));

describe('FavoritesTable', () => {
  // Set a fixed date for all tests
  const fixedDate = new Date('2023-05-15T12:00:00Z');

  // Setup mock mutation before each test
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Use fake timers and set a fixed system time
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);

    // Setup mock mutation
    mockMutate = vi.fn();
    // Use type assertion to avoid TypeScript errors
    vi.mocked(reactQuery.useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      variables: null,
      // Add required properties with default values
      data: undefined,
      error: null,
      isError: false,
      isIdle: false,
      isLoading: false,
      isSuccess: false,
      status: 'idle',
      reset: vi.fn(),
      mutateAsync: vi.fn(),
    } as unknown as reactQuery.UseMutationResult);
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

  // Mock function for onViewPlace prop
  const mockOnViewPlace = vi.fn();

  it('renders favorites table with data', () => {
    render(
      <FavoritesTable favorites={mockFavorites} onViewPlace={mockOnViewPlace} />
    );

    // Check for the heading with count
    expect(screen.getByText('Your Favorite Places (2)')).toBeInTheDocument();

    // Check for table headers
    expect(screen.getByText('Place ID')).toBeInTheDocument();
    expect(screen.getByText('Favorited On')).toBeInTheDocument();

    // Check for place IDs
    expect(screen.getByText('place_1')).toBeInTheDocument();
    expect(screen.getByText('place_2')).toBeInTheDocument();

    // Instead of checking for specific date strings, which can vary by locale,
    // we'll just verify that the date cells exist and contain some content
    const dateCells = screen.getAllByRole('cell', { name: /\d+\/\d+\/\d+/ });
    expect(dateCells.length).toBe(2);
  });

  it('displays message when no favorites exist', () => {
    render(<FavoritesTable favorites={[]} onViewPlace={mockOnViewPlace} />);

    expect(
      screen.getByText("You haven't favorited any places yet.")
    ).toBeInTheDocument();
  });

  it('displays message when favorites is undefined', () => {
    render(
      <FavoritesTable favorites={undefined} onViewPlace={mockOnViewPlace} />
    );

    expect(
      screen.getByText("You haven't favorited any places yet.")
    ).toBeInTheDocument();
  });

  it('calls onViewPlace when View button is clicked', () => {
    render(
      <FavoritesTable favorites={mockFavorites} onViewPlace={mockOnViewPlace} />
    );

    // Find the first View button and click it
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Check that onViewPlace was called with the correct place ID
    expect(mockOnViewPlace).toHaveBeenCalledWith('place_1');
  });

  it('optimistically updates UI and calls mutation when Unfavorite button is clicked', () => {
    render(
      <FavoritesTable favorites={mockFavorites} onViewPlace={mockOnViewPlace} />
    );

    // Find the first Unfavorite button and click it
    const unfavoriteButtons = screen.getAllByText('Unfavorite');
    fireEvent.click(unfavoriteButtons[0]);

    // Check that removeFavorite was called with the correct place ID (optimistic update)
    expect(mockRemoveFavorite).toHaveBeenCalledWith('place_1');

    // Check that the mutation was called with the correct place ID
    expect(mockMutate).toHaveBeenCalledWith('place_1', expect.any(Object));

    // Simulate the success callback
    const successCallback = mockMutate.mock.calls[0][1].onSuccess;
    if (successCallback) {
      successCallback();
    }

    // Check that toast.success was called with the correct message and undo action
    expect(toast.success).toHaveBeenCalledWith('Place removed from favorites', {
      description: 'Place ID: place_1',
      action: expect.objectContaining({
        label: 'Undo',
        onClick: expect.any(Function),
      }),
    });
  });

  it('shows info toast and restores favorite when Undo is clicked', () => {
    render(
      <FavoritesTable favorites={mockFavorites} onViewPlace={mockOnViewPlace} />
    );

    // Find the first Unfavorite button and click it
    const unfavoriteButtons = screen.getAllByText('Unfavorite');
    fireEvent.click(unfavoriteButtons[0]);

    // Simulate the success callback
    const successCallback = mockMutate.mock.calls[0][1].onSuccess;
    if (successCallback) {
      successCallback();
    }

    // Get the onClick handler from the toast.success call
    const successCall = vi.mocked(toast.success).mock
      .calls[0][1] as ToastOptions;
    const undoAction = successCall?.action;

    // Call the onClick handler
    if (undoAction && typeof undoAction.onClick === 'function') {
      undoAction.onClick();
    }

    // Check that toast.info was called with the correct message
    expect(toast.info).toHaveBeenCalledWith('Restoring favorite...');

    // Check that addFavorite was called with the stored favorite (optimistic update)
    expect(mockAddFavorite).toHaveBeenCalled();

    // Check that the mutation was called again with the same place ID
    expect(mockMutate).toHaveBeenCalledTimes(2);

    // Simulate the success callback of the second mutation
    const secondCallOptions = mockMutate.mock.calls[1][1];
    if (secondCallOptions?.onSuccess) {
      secondCallOptions.onSuccess();
    }

    // Check that toast.success was called with the restore message
    expect(toast.success).toHaveBeenCalledWith('Place restored to favorites');
  });

  it('shows loading state when mutation is pending', () => {
    // Override the mock implementation for this test to show pending state
    vi.mocked(reactQuery.useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      variables: 'place_1',
      // Add required properties with default values
      data: undefined,
      error: null,
      isError: false,
      isIdle: false,
      isLoading: true,
      isSuccess: false,
      status: 'loading',
      reset: vi.fn(),
      mutateAsync: vi.fn(),
    } as unknown as reactQuery.UseMutationResult);

    render(
      <FavoritesTable favorites={mockFavorites} onViewPlace={mockOnViewPlace} />
    );

    // Check that the first button shows loading state
    expect(screen.getByText('Removing...')).toBeInTheDocument();

    // Check that the button is disabled
    const button = screen.getByText('Removing...').closest('button');
    expect(button).toBeDisabled();
  });
});
