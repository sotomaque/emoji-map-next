import { useRouter } from 'next/navigation';
import { useGateValue } from '@statsig/react-bindings';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfilePage from './page';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@statsig/react-bindings', () => ({
  useGateValue: vi.fn(),
}));

describe('ProfilePage', () => {
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
  });

  it('renders the profile page when feature flag is enabled', () => {
    render(<ProfilePage />);

    // Check for the heading
    expect(screen.getByText('Your Profile Page')).toBeInTheDocument();

    // Check for the placeholder text
    expect(
      screen.getByText('Profile content will be added here in the future.')
    ).toBeInTheDocument();

    // Check for the back button
    const backButton = screen.getByText('Back to Dashboard');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/app');
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

    render(<ProfilePage />);

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
