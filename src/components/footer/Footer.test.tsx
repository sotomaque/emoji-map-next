import { render, screen } from '@testing-library/react';
import { Footer } from './footer';
import { navItems } from '@/constants/routes';
import { vi, describe, it, expect } from 'vitest';
import * as navigation from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/'),
}));

describe('Footer', () => {
  it('renders the copyright text', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Emoji Map. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Footer />);

    // Check that all nav items are rendered
    navItems.forEach((item) => {
      const link = screen.getByText(item.label);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', item.href);

      // Check if external links have the correct attributes
      if (item.target) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });
  });

  it('applies active styles to the current path', () => {
    // Mock the usePathname hook to return a specific path
    const usePathnameMock = vi.spyOn(navigation, 'usePathname');
    usePathnameMock.mockReturnValue('/about');

    render(<Footer />);

    // The About link should have the active class
    const aboutLink = screen.getByText('About');
    expect(aboutLink).toHaveClass(
      'text-gray-900 dark:text-gray-100 font-medium'
    );

    // Other links should not have the active class
    const homeLink = screen.getByText('Home');
    expect(homeLink).not.toHaveClass(
      'text-gray-900 dark:text-gray-100 font-medium'
    );
  });
});
