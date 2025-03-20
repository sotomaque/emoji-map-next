import * as navigation from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as navHooks from '@/hooks/useNavItems/useNavItems';
import type { NavItem } from '@/types/nav-items';
import { DesktopNav } from './desktop-nav';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/'),
}));

// Mock the useNavItems hook
vi.mock('@/hooks/useNavItems/useNavItems', () => ({
  useNavItems: vi.fn(),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid='chevron-down'>▼</span>,
}));

describe('DesktopNav', () => {
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
      label: 'With Children',
      href: '/parent',
      target: false,
      children: [
        {
          label: 'Child 1',
          href: '/parent/child1',
          target: false,
        },
        {
          label: 'Child 2',
          href: '/parent/child2',
          target: true,
        },
        {
          label: 'Hidden Child',
          href: '/parent/hidden',
          target: false,
          hidden: true,
        },
      ],
    },
    {
      label: 'App',
      href: '/app',
      target: true,
      featureFlag: 'ENABLE_APP',
    },
  ];

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
      filterNavItems: (items: NavItem[]) =>
        items.filter(mockShouldShowNavItem).map((item) => {
          if (item.children) {
            return {
              ...item,
              children: item.children.filter(mockShouldShowNavItem),
            };
          }
          return item;
        }),
    });
  });

  it('renders visible navigation items', () => {
    render(<DesktopNav navItems={mockNavItems} />);

    // Visible items should be rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('External')).toBeInTheDocument();
    expect(screen.getByText('With Children')).toBeInTheDocument();

    // Hidden items should not be rendered
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

    // Feature flagged items should not be rendered
    expect(screen.queryByText('App')).not.toBeInTheDocument();
  });

  it('applies active styles to the current path', () => {
    // Mock the usePathname hook to return a specific path
    const usePathnameMock = vi.spyOn(navigation, 'usePathname');
    usePathnameMock.mockReturnValue('/about');

    render(<DesktopNav navItems={mockNavItems} />);

    // The About link should have the active class
    const aboutLink = screen.getByText('About').closest('a');
    expect(aboutLink).toHaveClass(
      'text-slate-600 dark:text-white font-semibold'
    );

    // Other links should not have the active class
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveClass(
      'text-slate-600 dark:text-white font-semibold'
    );
  });

  it('renders external links with target="_blank" and rel attributes', () => {
    render(<DesktopNav navItems={mockNavItems} />);

    const externalLink = screen.getByText('External').closest('a');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders dropdown indicators and child items for items with children', () => {
    render(<DesktopNav navItems={mockNavItems} />);

    // Should have a chevron icon
    const chevrons = screen.getAllByTestId('chevron-down');
    expect(chevrons.length).toBeGreaterThan(0);

    // Should have a dropdown container
    const dropdown = screen.getByTestId('nav-child');
    expect(dropdown).toBeInTheDocument();

    // Should contain child links
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();

    // Hidden child should not be rendered
    expect(screen.queryByText('Hidden Child')).not.toBeInTheDocument();
  });

  it('shows feature flagged items when enabled', () => {
    // Mock the useNavItems hook to enable the App feature flag
    (navHooks.useNavItems as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldShowNavItem: (item: NavItem) => {
        if (item.hidden) return false;
        return true; // All feature flags enabled
      },
      filterNavItems: (items: NavItem[]) =>
        items
          .filter((item) => !item.hidden)
          .map((item) => {
            if (item.children) {
              return {
                ...item,
                children: item.children.filter((child) => !child.hidden),
              };
            }
            return item;
          }),
    });

    render(<DesktopNav navItems={mockNavItems} />);

    // App should now be rendered
    expect(screen.getByText('App')).toBeInTheDocument();
  });
});
