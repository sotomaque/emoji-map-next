import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { VerifyDialog } from '../verify-dialog';
import type { DashboardState } from '../../reducer';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VerifyDialog', () => {
  const mockHandleCloseDialog = vi.fn();
  const mockDispatch = vi.fn();
  const queryClient = new QueryClient();

  const mockSelectedPlace = {
    id: '123',
    displayName: 'Test Business',
    formattedAddress: '123 Test St',
    nationalPhoneNumber: '(555) 123-4567',
  };

  const mockState: DashboardState = {
    dialogState: 'verify',
    isSubmitting: false,
    loadingSteps: [],
    searchResults: [],
    selectedPlace: mockSelectedPlace,
  };

  const defaultProps = {
    handleCloseDialog: mockHandleCloseDialog,
    state: mockState,
    dispatch: mockDispatch,
  };

  const user = userEvent.setup();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  function renderWithQueryClient(ui: React.ReactElement) {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  }

  test('renders dialog with business name when open', () => {
    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    expect(screen.getByText('Verify Your Business')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Please enter the phone number associated with Test Business/
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Business Phone Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('does not render when dialogState is not verify', () => {
    renderWithQueryClient(
      <VerifyDialog
        {...defaultProps}
        state={{ ...mockState, dialogState: 'list' }}
      />
    );

    expect(screen.queryByText('Verify Your Business')).not.toBeInTheDocument();
  });

  test('formats phone number as user types', async () => {
    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    const input = screen.getByLabelText('Business Phone Number');
    await user.type(input, '5551234567');

    expect(input).toHaveValue('(555) 123-4567');
  });

  test('shows validation error for short phone number', async () => {
    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText('(555) 555-5555');
    const verifyButton = screen.getByRole('button', { name: 'Verify' });

    await user.type(phoneInput, '123');
    await user.click(verifyButton);

    const errorMessage = await screen.findByText(
      /phone number must be at least 10 digits/i
    );
    expect(errorMessage).toBeInTheDocument();
  });

  test('handles successful verification', async () => {
    (global.fetch as unknown) = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    const input = screen.getByLabelText('Business Phone Number');
    await user.type(input, '5551234567');

    const verifyButton = screen.getByRole('button', { name: 'Verify' });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SUBMITTING',
        payload: true,
      });
      expect(toast.success).toHaveBeenCalledWith('Place claimed successfully!');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_DIALOG' });
    });
  });

  test('handles verification failure due to number mismatch', async () => {
    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    const input = screen.getByLabelText('Business Phone Number');
    await user.type(input, '5559876543'); // Different number than mockSelectedPlace

    const verifyButton = screen.getByRole('button', { name: 'Verify' });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Phone number does not match our records.'
      );
    });
  });

  test('handles API error during verification', async () => {
    const errorMessage = 'Failed to associate place';
    (global.fetch as unknown) = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    });

    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    const input = screen.getByLabelText('Business Phone Number');
    await user.type(input, '5551234567');

    const verifyButton = screen.getByRole('button', { name: 'Verify' });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('handles dialog close via Cancel button', async () => {
    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockHandleCloseDialog).toHaveBeenCalled();
  });

  test('handles dialog close via X button', async () => {
    renderWithQueryClient(<VerifyDialog {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(mockHandleCloseDialog).toHaveBeenCalled();
  });

  test('disables submit button while submitting', async () => {
    renderWithQueryClient(
      <VerifyDialog
        {...defaultProps}
        state={{ ...mockState, isSubmitting: true }}
      />
    );

    const verifyButton = screen.getByRole('button', { name: 'Verifying...' });
    expect(verifyButton).toBeDisabled();
  });
});
