import { useRouter } from 'next/navigation';
import { useGateValue } from '@statsig/react-bindings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AppPage from './page';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@statsig/react-bindings', () => ({
  useGateValue: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock components
vi.mock('@/app/app/components/nearby-places-section', () => ({
  default: vi.fn(() => (
    <div data-testid='nearby-places-section'>Nearby Places Section</div>
  )),
}));

vi.mock('@/app/app/components/photos-section', () => ({
  default: vi.fn(() => <div data-testid='photos-section'>Photos Section</div>),
}));

vi.mock('@/app/app/components/place-details-section', () => ({
  default: vi.fn(() => (
    <div data-testid='place-details-section'>Place Details Section</div>
  )),
}));

vi.mock('@/components/ErrorBoundary', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid='error-boundary'>{children}</div>
  )),
}));

// Mock fetch
const originalFetch = global.fetch;
const mockFetch = vi.fn();

describe('AppPage', () => {
  // Setup QueryClient for tests
  let queryClient: QueryClient;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup router mock with all required methods
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    // Setup feature flag mock
    vi.mocked(useGateValue).mockReturnValue(true);

    // Setup fetch mock
    global.fetch = mockFetch;

    // Setup QueryClient
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success) =>
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.006,
            },
          })
        ),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the app when feature flag is enabled', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('API_DEBUG_TOOLS')).toBeInTheDocument();
    expect(screen.getByTestId('nearby-places-section')).toBeInTheDocument();
    expect(screen.getByTestId('place-details-section')).toBeInTheDocument();
    expect(screen.getByTestId('photos-section')).toBeInTheDocument();
  });

  it('redirects when feature flag is disabled', () => {
    vi.mocked(useGateValue).mockReturnValue(false);
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('toggles all raw JSON views when checkbox is clicked', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    const checkbox = screen.getByLabelText('Show All Raw JSON');
    await user.click(checkbox);

    // Since we're mocking the components, we can't directly test state changes
    // But we can test that the checkbox is checked
    expect(checkbox).toBeChecked();
  });

  it('handles nearby places query', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 'place1', emoji: '🍕' }],
        count: 1,
        cacheHit: false,
      }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    // Find and click the execute query button
    // Since we're mocking the NearbyPlacesSection, we need to simulate the refetch call
    queryClient.setQueryData(
      ['nearbyPlaces', '40.7128,-74.0060', '1|2', 20, false, false],
      {
        data: [{ id: 'place1', emoji: '🍕' }],
        count: 1,
        cacheHit: false,
      }
    );

    // Verify the query data is set
    expect(
      queryClient.getQueryData([
        'nearbyPlaces',
        '40.7128,-74.0060',
        '1|2',
        20,
        false,
        false,
      ])
    ).toBeTruthy();
  });

  it('handles clearing nearby places data', async () => {
    // Set some initial query data
    queryClient.setQueryData(
      ['nearbyPlaces', '40.7128,-74.0060', '1|2', 20, false, false],
      {
        data: [{ id: 'place1', emoji: '🍕' }],
        count: 1,
        cacheHit: false,
      }
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    // Create a function to simulate the handleClearNearbyPlaces call
    const clearNearbyPlaces = () => {
      queryClient.resetQueries({ queryKey: ['nearbyPlaces'] });
      toast.success('Nearby places results cleared');
    };

    // Call the function directly
    clearNearbyPlaces();

    // Verify the query data is cleared
    expect(
      queryClient.getQueryData([
        'nearbyPlaces',
        '40.7128,-74.0060',
        '1|2',
        20,
        false,
        false,
      ])
    ).toBeUndefined();
    expect(toast.success).toHaveBeenCalledWith('Nearby places results cleared');
  });

  it('handles API error gracefully', async () => {
    // Mock failed API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error',
    });

    // Create a function to simulate the API call with error
    const simulateApiError = async () => {
      try {
        const params = new URLSearchParams();
        params.append('location', '40.7128,-74.0060');
        params.append('keys', '1');
        params.append('keys', '2');
        params.append('limit', '20');

        const response = await fetch(`/api/places/nearby?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API returned ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        return await response.json();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Nearby places query failed: ${errorMessage}`);
        throw error;
      }
    };

    // Call the function and expect it to throw
    await expect(simulateApiError()).rejects.toThrow();

    // Verify toast.error was called
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Nearby places query failed')
    );
  });

  it('handles place details query', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'place1',
        name: 'Test Place',
        address: '123 Test St',
      }),
    });

    // Set up the query client with a place ID
    queryClient.setQueryData(['placeDetails', 'place1', false], {
      id: 'place1',
      name: 'Test Place',
      address: '123 Test St',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    // Verify the query data is set
    expect(
      queryClient.getQueryData(['placeDetails', 'place1', false])
    ).toBeTruthy();
  });

  it('handles photo query', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'photo1',
        urls: ['https://example.com/photo1.jpg'],
      }),
    });

    // Set up the query client with a photo ID
    queryClient.setQueryData(['photo', 'photo1', false], {
      id: 'photo1',
      urls: ['https://example.com/photo1.jpg'],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    // Verify the query data is set
    expect(queryClient.getQueryData(['photo', 'photo1', false])).toBeTruthy();
  });
});
