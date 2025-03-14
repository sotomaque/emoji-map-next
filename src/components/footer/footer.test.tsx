import * as navigation from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as navHooks from '@/hooks/useNavItems/useNavItems';
import type { NavItem } from '@/types/nav-items';
import { Footer } from './footer';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/'),
}));

// Mock the useNavItems hook
vi.mock('@/hooks/useNavItems/useNavItems', () => ({
  useNavItems: vi.fn(),
}));

// Mock the constants/routes module
vi.mock('@/constants/routes', () => {
  const mockNavItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      target: false,
    },
    {
      label: 'About',
      href: '/about',
      target: false,
    },
    {
      label: 'External',
      href: 'https://example.com',
      target: true,
    },
    {
      label: 'Hidden',
      href: '/hidden',
      target: false,
      hidden: true,
    },
    {
      label: 'App',
      href: '/app',
      target: true,
      featureFlag: 'ENABLE_APP',
    },
  ];

  return {
    navItems: mockNavItems,
  };
});

describe('Footer', () => {
  // Mock implementation of shouldShowNavItem
  const mockShouldShowNavItem = (item: NavItem) => {
    if (item.hidden) return false;
    if (item.featureFlag === 'ENABLE_APP') return false;
    return true;
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock implementation
    (navHooks.useNavItems as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldShowNavItem: mockShouldShowNavItem,
      filterNavItems: (items: NavItem[]) => items.filter(mockShouldShowNavItem),
    });
  });

  it('renders the copyright text', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Emoji Map. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('renders visible navigation items', () => {
    render(<Footer />);

    // Visible items should be rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('External')).toBeInTheDocument();

    // Hidden items should not be rendered
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

    // Feature flagged items should not be rendered
    expect(screen.queryByText('App')).not.toBeInTheDocument();

    // Check that links have the correct attributes
    const externalLink = screen.getByText('External');
    expect(externalLink).toHaveAttribute('href', 'https://example.com');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
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

  it('shows feature flagged items when enabled', () => {
    // Mock the useNavItems hook to enable the App feature flag
    (navHooks.useNavItems as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldShowNavItem: (item: NavItem) => {
        if (item.hidden) return false;
        return true; // All feature flags enabled
      },
      filterNavItems: (items: NavItem[]) =>
        items.filter((item) => !item.hidden),
    });

    render(<Footer />);

    // App should now be rendered
    expect(screen.getByText('App')).toBeInTheDocument();
  });
});
