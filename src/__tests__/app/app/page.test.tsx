import { useRouter } from 'next/navigation';
import { useGateValue } from '@statsig/react-bindings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppPage from '@/app/app/page';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

// Mock the @statsig/react-bindings module
vi.mock('@statsig/react-bindings', () => ({
  useGateValue: vi.fn(),
  LogLevel: {
    Debug: 'debug',
    Info: 'info',
    Warn: 'warn',
    Error: 'error',
  },
  StatsigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the components and hooks used in AppPage
vi.mock('@/components/map/emoji-selector/emoji-selector-skeleton', () => ({
  default: () => (
    <div data-testid='emoji-selector-skeleton'>Emoji Selector Skeleton</div>
  ),
}));

vi.mock('@/components/map/map-skeleton', () => ({
  default: () => <div data-testid='map-skeleton'>Map Skeleton</div>,
}));

vi.mock('@/store/useFiltersStore', () => ({
  useFiltersStore: vi.fn(() => ({
    selectedCategoryKeys: [],
    showFavoritesOnly: false,
    isAllCategoriesMode: true,
    getAllCategoryKeys: vi.fn(() => [1, 2, 3, 4, 5]),
    openNow: false,
    priceLevel: [1, 2, 3, 4],
    minimumRating: null,
    userLocation: null,
    viewport: { center: null, bounds: null, zoom: 10 },
    setUserLocation: vi.fn(),
    setViewportCenter: vi.fn(),
    setViewportBounds: vi.fn(),
    setViewportZoom: vi.fn(),
    getSelectedCategoryNames: vi.fn(() => []),
  })),
}));

vi.mock('@/hooks/usePlaces/usePlaces', () => ({
  usePlaces: vi.fn(() => ({
    isLoading: false,
    refetch: vi.fn(),
    data: { mapDataPoints: [] },
  })),
  useCurrentLocation: vi.fn(() => ({
    data: { lat: 37.7749, lng: -122.4194 },
    isLoading: false,
    isSuccess: true,
    error: null,
  })),
}));

vi.mock('@/store/markerStore', () => ({
  useMarkerStore: vi.fn(() => ({
    visibleMarkers: [],
    newMarkerIds: [],
    isTransitioning: false,
    setMarkers: vi.fn(),
    setVisibleMarkers: vi.fn(),
    setCurrentViewport: vi.fn(),
    setIsTransitioning: vi.fn(),
    hasViewportCached: vi.fn(() => false),
    filterMarkers: vi.fn(() => []),
    clearCache: vi.fn(),
  })),
}));

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
  default: () => {
    const Component = () => <div>Dynamic Component</div>;
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

describe('AppPage', () => {
  const mockRouter = {
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  // Create a new QueryClient for each test
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(
      mockRouter as ReturnType<typeof useRouter>
    );

    // Initialize a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock console methods to keep test output clean
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should redirect to home page when app is disabled', () => {
    // Mock the feature flag to return false (app disabled)
    vi.mocked(useGateValue).mockReturnValue(false);

    // Render the component
    render(<AppPage />);

    // Verify that router.push was called with '/'
    expect(mockRouter.push).toHaveBeenCalledWith('/');
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  it('should render AppContent when app is enabled', () => {
    // Mock the feature flag to return true (app enabled)
    vi.mocked(useGateValue).mockReturnValue(true);

    // Render the component with QueryClientProvider
    render(
      <QueryClientProvider client={queryClient}>
        <AppPage />
      </QueryClientProvider>
    );

    // Verify that router.push was not called
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
