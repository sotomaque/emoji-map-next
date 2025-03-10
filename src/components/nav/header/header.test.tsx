import { render, screen } from '@testing-library/react';
import { Header } from './header';
import { vi, describe, it, expect } from 'vitest';
import type { NavItem } from '@/types/nav-items';

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

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header', () => {
  it('renders the logo with a link to home', () => {
    render(<Header />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: 'Home page' });
    expect(homeLink).toHaveAttribute('href', '/');
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
