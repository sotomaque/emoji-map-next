import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import type { NavItem } from '@/types/nav-items';
import { Header } from './header';

// Mock the child components
vi.mock('../logo/logo', () => ({
  Logo: () => <div data-testid='logo'>Logo</div>,
}));

vi.mock('../desktop-nav/desktop-nav', () => ({
  DesktopNav: ({ navItems }: { navItems: NavItem[] }) => (
    <div data-testid='desktop-nav'>
      Desktop Nav with {navItems.length} items
    </div>
  ),
}));

vi.mock('../mobile-nav/mobile-nav', () => ({
  MobileNav: ({ navItems }: { navItems: NavItem[] }) => (
    <div data-testid='mobile-nav'>Mobile Nav with {navItems.length} items</div>
  ),
}));

vi.mock('../mode-toggle/mode-toggle', () => ({
  ModeToggle: () => <div data-testid='mode-toggle'>Mode Toggle</div>,
}));

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='signed-in'>{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='signed-out'>{children}</div>
  ),
  SignInButton: ({
    children,
    mode,
    appearance,
  }: {
    children: React.ReactNode;
    mode?: string;
    appearance?: Record<string, unknown>;
  }) => (
    <div
      data-testid='sign-in-button'
      data-mode={mode}
      data-has-appearance={!!appearance}
    >
      {children || 'Sign In'}
    </div>
  ),
}));

// Mock ThemedUserButton
vi.mock('@/components/auth/themed-user-button', () => ({
  default: () => <div data-testid='themed-user-button'>User Button</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header', () => {
  describe('Default behavior (showAuth=false)', () => {
    it('renders the logo with a link to home', () => {
      render(<Header />);

      const logo = screen.getByTestId('logo');
      expect(logo).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: 'Home page' });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('does not render auth components', () => {
      render(<Header />);

      expect(screen.queryByTestId('signed-in')).not.toBeInTheDocument();
      expect(screen.queryByTestId('signed-out')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-button')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('themed-user-button')
      ).not.toBeInTheDocument();
    });

    it('renders the desktop navigation on large screens', () => {
      render(<Header />);

      const desktopNav = screen.getByTestId('desktop-nav');
      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav.parentElement).toHaveClass('hidden xl:flex');
    });

    it('renders the mobile navigation on small screens', () => {
      render(<Header />);

      const mobileNav = screen.getByTestId('mobile-nav');
      expect(mobileNav).toBeInTheDocument();
      expect(mobileNav.parentElement).toHaveClass('flex xl:hidden');
    });

    it('renders the mode toggle in both desktop and mobile views', () => {
      render(<Header />);

      const modeToggles = screen.getAllByTestId('mode-toggle');
      expect(modeToggles).toHaveLength(2);
    });
  });

  describe('Auth mode (showAuth=true)', () => {
    it('renders auth components instead of logo', () => {
      render(<Header showAuth={true} />);

      // Auth components should be present
      expect(screen.getByTestId('signed-in')).toBeInTheDocument();
      expect(screen.getByTestId('signed-out')).toBeInTheDocument();

      // Logo should not be present
      expect(screen.queryByTestId('logo')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Home page' })
      ).not.toBeInTheDocument();
    });

    it('still renders navigation and mode toggle', () => {
      render(<Header showAuth={true} />);

      // Navigation should still be present
      expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();

      // Mode toggles should still be present
      const modeToggles = screen.getAllByTestId('mode-toggle');
      expect(modeToggles).toHaveLength(2);
    });
  });
});
