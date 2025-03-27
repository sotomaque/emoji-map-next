import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { ClaimDialog } from '../claim-dialog';
import type { DashboardState } from '../../reducer';

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Create a wrapper with necessary providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
TestWrapper.displayName = 'TestWrapper';

describe('ClaimDialog', () => {
  const mockDispatch = vi.fn();
  const mockState: DashboardState = {
    isSubmitting: false,
    searchResults: [],
    dialogState: 'claim',
    loadingSteps: [{ message: 'Finding your business', status: 'pending' }],
    selectedPlace: null,
  };
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    state: mockState,
    dispatch: mockDispatch,
  };

  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test('renders dialog with form fields when open', () => {
    render(<ClaimDialog {...defaultProps} />, { wrapper: TestWrapper });

    expect(screen.getByText('Claim Your Business')).toBeInTheDocument();
    expect(screen.getByLabelText('Business Name')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
  });

  test('validates form fields on submit', async () => {
    render(<ClaimDialog {...defaultProps} />, { wrapper: TestWrapper });

    await user.click(screen.getByText('Submit'));

    expect(
      await screen.findByText('Business name must be at least 2 characters.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('City must be at least 2 characters.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Please enter a valid state abbreviation.')
    ).toBeInTheDocument();
  });

  test('handles successful form submission', async () => {
    const mockSearchResponse = {
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1, name: 'Test Business' }] }),
    };
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockSearchResponse
    );

    render(<ClaimDialog {...defaultProps} />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText('Business Name'), 'Test Business');
    await user.type(screen.getByLabelText('City'), 'Test City');
    await user.type(screen.getByLabelText('State'), 'CA');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SUBMITTING',
        payload: true,
      });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_LOADING' });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SHOW_LIST',
        payload: { searchResults: [{ id: 1, name: 'Test Business' }] },
      });
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/merchant/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Business',
        city: 'Test City',
        state: 'CA',
      }),
    });
  });

  test('handles no results found', async () => {
    const mockSearchResponse = {
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    };
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockSearchResponse
    );

    render(<ClaimDialog {...defaultProps} />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText('Business Name'), 'Test Business');
    await user.type(screen.getByLabelText('City'), 'Test City');
    await user.type(screen.getByLabelText('State'), 'CA');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'HANDLE_ERROR',
        payload: { stepIndex: 0 },
      });
      expect(toast.error).toHaveBeenCalledWith(
        'No matching places found. Please check your business details.'
      );
    });
  });

  test('handles API error', async () => {
    const mockErrorResponse = {
      ok: false,
      json: () => Promise.resolve({ error: 'API Error' }),
    };
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockErrorResponse
    );

    render(<ClaimDialog {...defaultProps} />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText('Business Name'), 'Test Business');
    await user.type(screen.getByLabelText('City'), 'Test City');
    await user.type(screen.getByLabelText('State'), 'CA');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('API Error');
    });
  });

  test('handles form reset on cancel', async () => {
    render(<ClaimDialog {...defaultProps} />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText('Business Name'), 'Test Business');
    await user.type(screen.getByLabelText('City'), 'Test City');
    await user.type(screen.getByLabelText('State'), 'CA');
    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByLabelText('Business Name')).toHaveValue('');
    expect(screen.getByLabelText('City')).toHaveValue('');
    expect(screen.getByLabelText('State')).toHaveValue('');
  });

  test('disables submit button while submitting', async () => {
    render(
      <ClaimDialog
        {...defaultProps}
        state={{ ...mockState, isSubmitting: true }}
      />,
      { wrapper: TestWrapper }
    );

    const submitButton = screen.getByText('Submitting...');
    expect(submitButton).toBeDisabled();
  });
});
