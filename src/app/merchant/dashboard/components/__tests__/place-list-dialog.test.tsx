import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { MerchantPlaceSearchResult } from '@/types/admin-search';
import { PlaceListDialog } from '../place-list-dialog';
import type { DashboardState } from '../../reducer';

describe('PlaceListDialog', () => {
  const mockHandleCloseDialog = vi.fn();
  const mockDispatch = vi.fn();
  const mockSearchResults: MerchantPlaceSearchResult[] = [
    {
      id: '1',
      displayName: 'Test Business 1',
      formattedAddress: '123 Test St, Test City, TC 12345',
      nationalPhoneNumber: '+1 (555) 123-4567',
    },
    {
      id: '2',
      displayName: 'Test Business 2',
      formattedAddress: '456 Test Ave, Test City, TC 12345',
      nationalPhoneNumber: '+1 (555) 987-6543',
    },
  ];

  const mockState: DashboardState = {
    dialogState: 'list',
    isSubmitting: false,
    loadingSteps: [],
    searchResults: mockSearchResults,
    selectedPlace: null,
  };

  const defaultProps = {
    handleCloseDialog: mockHandleCloseDialog,
    state: mockState,
    dispatch: mockDispatch,
  };

  const user = userEvent.setup();

  test('renders dialog with search results when open', () => {
    render(<PlaceListDialog {...defaultProps} />);

    expect(screen.getByText('Found Places')).toBeInTheDocument();
    expect(
      screen.getByText('Here are the places that match your search criteria.')
    ).toBeInTheDocument();

    // Check if all businesses are rendered
    mockSearchResults.forEach((place) => {
      expect(screen.getByText(place.displayName)).toBeInTheDocument();
      expect(screen.getByText(place.formattedAddress)).toBeInTheDocument();
    });

    // Check if each result has a select button
    const selectButtons = screen.getAllByText('Select');
    expect(selectButtons).toHaveLength(mockSearchResults.length);
  });

  test('handles place selection', async () => {
    render(<PlaceListDialog {...defaultProps} />);

    const selectButtons = screen.getAllByText('Select');
    await user.click(selectButtons[0]);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SELECT_PLACE',
      payload: mockSearchResults[0],
    });
  });

  test('handles dialog close via Close button', async () => {
    render(<PlaceListDialog {...defaultProps} />);

    // Get the main Close button at the bottom of the dialog
    const buttons = screen.getAllByRole('button', { name: 'Close' });
    const mainCloseButton = buttons.find(
      (button) => !button.classList.contains('absolute')
    );
    await user.click(mainCloseButton!);

    expect(mockHandleCloseDialog).toHaveBeenCalled();
  });

  test('handles dialog close via X button', async () => {
    render(<PlaceListDialog {...defaultProps} />);

    // Get the X button in the corner by its position class
    const buttons = screen.getAllByRole('button', { name: 'Close' });
    const xButton = buttons.find((button) =>
      button.classList.contains('absolute')
    );
    await user.click(xButton!);

    expect(mockHandleCloseDialog).toHaveBeenCalled();
  });

  test('does not render when dialogState is not "list"', () => {
    render(
      <PlaceListDialog
        {...defaultProps}
        state={{ ...mockState, dialogState: 'claim' }}
      />
    );

    expect(screen.queryByText('Found Places')).not.toBeInTheDocument();
  });

  test('renders empty state when no search results', () => {
    render(
      <PlaceListDialog
        {...defaultProps}
        state={{ ...mockState, searchResults: [] }}
      />
    );

    expect(screen.getByText('Found Places')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Select' })
    ).not.toBeInTheDocument();
  });

  test('renders scrollable container for many results', () => {
    const manyResults = Array.from({ length: 10 }, (_, i) => ({
      ...mockSearchResults[0],
      id: String(i),
      displayName: `Test Business ${i}`,
    }));

    render(
      <PlaceListDialog
        {...defaultProps}
        state={{ ...mockState, searchResults: manyResults }}
      />
    );

    const container = screen
      .getByRole('dialog')
      .querySelector('.overflow-y-auto');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('max-h-[400px]');
  });
});
