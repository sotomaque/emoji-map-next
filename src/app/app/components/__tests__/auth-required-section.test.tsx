import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AuthRequiredSection } from '../auth-required-section';

// Mock the Clerk SignInButton component
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='mock-sign-in-button'>{children}</div>
  ),
}));

describe('AuthRequiredSection', () => {
  it('renders the authentication required card correctly', () => {
    render(<AuthRequiredSection />);

    // Check for the heading
    expect(
      screen.getByText('Admin Authentication Required')
    ).toBeInTheDocument();

    // Check for the description text
    expect(
      screen.getByText(
        'You need to sign in and have the correct permissions to access this section of the application.'
      )
    ).toBeInTheDocument();

    // Check for the sign in button
    const signInButton = screen.getByTestId('mock-sign-in-button');
    expect(signInButton).toBeInTheDocument();

    // Check that the button text is correct
    expect(screen.getByText('Sign In to Continue')).toBeInTheDocument();

    // Check that the LockKeyhole icon is present (by its role)
    const lockIcon = document.querySelector('svg');
    expect(lockIcon).toBeInTheDocument();
  });
});
