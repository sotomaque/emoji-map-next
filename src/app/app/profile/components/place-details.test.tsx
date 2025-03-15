import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PlaceDetails from './place-details';

// Mock fetch
global.fetch = vi.fn();

// Create a wrapper component with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryDelay: 1, // Minimal delay for tests
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('PlaceDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state when fetching place details', async () => {
    // Mock fetch to return a promise that doesn't resolve immediately
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));

    render(<PlaceDetails placeId='test-place-id' />, {
      wrapper: createWrapper(),
    });

    // Check for loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    // Mock fetch to reject with an error
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<PlaceDetails placeId='test-place-id' />, {
      wrapper: createWrapper(),
    });

    // Wait for the error message to appear with a longer timeout
    await waitFor(
      () => {
        // Look for the error message container
        const errorContainer = screen.getByText('Error:', { exact: false });
        expect(errorContainer).toBeInTheDocument();

        // Check for the Try Again button
        const tryAgainButton = screen.getByRole('button', {
          name: /try again/i,
        });
        expect(tryAgainButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('shows place details when fetch succeeds', async () => {
    // Mock successful response
    const mockPlaceDetails = {
      data: {
        name: 'Test Place',
        displayName: 'Test Place Display Name',
        primaryTypeDisplayName: 'Restaurant',
        rating: 4.5,
        userRatingCount: 100,
        priceLevel: 2,
        openNow: true,
        editorialSummary: 'A great place to eat',
        takeout: true,
        delivery: false,
        dineIn: true,
        outdoorSeating: true,
        goodForChildren: true,
        goodForGroups: false,
        generativeSummary: 'This is a summary of the place',
      },
      cacheHit: false,
      count: 1,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaceDetails,
    } as Response);

    render(<PlaceDetails placeId='test-place-id' />, {
      wrapper: createWrapper(),
    });

    // Wait for the place details to appear
    await waitFor(() => {
      expect(screen.getByText('Test Place Display Name')).toBeInTheDocument();
    });

    // Check for other details
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('4.5 (100 reviews)')).toBeInTheDocument();
    expect(screen.getByText('Open Now')).toBeInTheDocument();
    expect(screen.getByText('A great place to eat')).toBeInTheDocument();
    expect(screen.getByText('Takeout')).toBeInTheDocument();
    expect(screen.getByText('Dine-in')).toBeInTheDocument();
    expect(screen.getByText('Outdoor Seating')).toBeInTheDocument();
    expect(screen.getByText('Good for Kids')).toBeInTheDocument();
    expect(
      screen.getByText('This is a summary of the place')
    ).toBeInTheDocument();
  });

  it('shows message when no place ID is provided', () => {
    render(<PlaceDetails placeId={null} />, { wrapper: createWrapper() });
    expect(
      screen.getByText('Select a place to view details')
    ).toBeInTheDocument();
  });
});
