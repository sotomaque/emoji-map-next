import { render, screen } from '@testing-library/react';
import { MobileNav } from './mobile-nav';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { NavItem } from '@/types/nav-items';
import * as navigation from 'next/navigation';
import * as navHooks from '@/hooks/useNavItems';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/'),
}));

// Mock the useNavItems hook
vi.mock('@/hooks/useNavItems', () => ({
  useNavItems: vi.fn(),
}));

// Mock the components used by MobileNav
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props} data-testid='mobile-menu-button'>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({
    children,
    open,
  }: React.PropsWithChildren<{
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
  }>) => (
    <div data-testid='sheet' data-open={open}>
      {children}
    </div>
  ),
  SheetTrigger: ({
    children,
    asChild,
  }: React.PropsWithChildren<{ asChild?: boolean }>) => (
    <div data-testid='sheet-trigger' data-aschild={asChild}>
      {children}
    </div>
  ),
  SheetContent: ({
    children,
    className,
  }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid='sheet-content' className={className}>
      {children}
    </div>
  ),
  SheetHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid='sheet-header'>{children}</div>
  ),
  SheetTitle: ({ children }: React.PropsWithChildren) => (
    <div data-testid='sheet-title'>{children}</div>
  ),
  SheetDescription: ({ children }: React.PropsWithChildren) => (
    <div data-testid='sheet-description'>{children}</div>
  ),
}));

vi.mock('@radix-ui/react-icons', () => ({
  TextAlignRightIcon: () => <span data-testid='menu-icon'>☰</span>,
}));

vi.mock('../logo/logo', () => ({
  Logo: () => <div data-testid='logo'>Logo</div>,
}));

describe('MobileNav', () => {
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

  it('renders a button to open the mobile menu', () => {
    render(<MobileNav navItems={mockNavItems} />);

    const menuButton = screen.getByTestId('mobile-menu-button');
    expect(menuButton).toBeInTheDocument();
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
  });

  it('renders the sheet content with navigation items', () => {
    render(<MobileNav navItems={mockNavItems} />);

    const sheetContent = screen.getByTestId('sheet-content');
    expect(sheetContent).toBeInTheDocument();
    expect(sheetContent).toHaveClass('bg-[#34409b]');

    // Logo should be in the header
    expect(screen.getByTestId('logo')).toBeInTheDocument();

    // Navigation items should be rendered (except hidden ones)
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('External')).toBeInTheDocument();
    expect(screen.getByText('With Children')).toBeInTheDocument();

    // Hidden items should not be rendered
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

    // Feature flagged items should not be rendered
    expect(screen.queryByText('App')).not.toBeInTheDocument();

    // Child items should be rendered correctly
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Child')).not.toBeInTheDocument();
  });

  it('applies active styles to the current path', () => {
    // Mock the usePathname hook to return a specific path
    const usePathnameMock = vi.spyOn(navigation, 'usePathname');
    usePathnameMock.mockReturnValue('/about');

    render(<MobileNav navItems={mockNavItems} />);

    // Find all links
    const links = screen.getAllByRole('link');

    // Find the About link
    const aboutLink = links.find((link) => link.textContent === 'About');
    expect(aboutLink).toHaveClass('font-bold');

    // Other links should not have the active class
    const homeLink = links.find((link) => link.textContent === 'Home');
    expect(homeLink).not.toHaveClass('font-bold');
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

    render(<MobileNav navItems={mockNavItems} />);

    // App should now be rendered
    expect(screen.getByText('App')).toBeInTheDocument();
  });
});
