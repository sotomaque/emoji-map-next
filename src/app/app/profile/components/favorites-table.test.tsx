import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FavoritesTable from './favorites-table';
import type { Favorite } from '@prisma/client';

describe('FavoritesTable', () => {
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

  it('logs to console when Unfavorite button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    render(
      <FavoritesTable favorites={mockFavorites} onViewPlace={mockOnViewPlace} />
    );

    // Find the first Unfavorite button and click it
    const unfavoriteButtons = screen.getAllByText('Unfavorite');
    fireEvent.click(unfavoriteButtons[0]);

    // Check that console.log was called with the correct message
    expect(consoleSpy).toHaveBeenCalledWith('UNFAVORITE CLICKED', 'place_1');

    // Clean up
    consoleSpy.mockRestore();
  });
});
