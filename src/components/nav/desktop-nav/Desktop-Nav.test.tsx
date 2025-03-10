'use client';

import { render, screen } from '@testing-library/react';
import { DesktopNav } from './desktop-nav';
import { vi, describe, it, expect } from 'vitest';
import type { NavItem } from '@/types/nav-items';
import * as navigation from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/'),
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
      ],
    },
  ];

  it('renders visible navigation items', () => {
    render(<DesktopNav navItems={mockNavItems} />);

    // Visible items should be rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('External')).toBeInTheDocument();
    expect(screen.getByText('With Children')).toBeInTheDocument();

    // Hidden items should not be rendered
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('applies active styles to the current path', () => {
    // Mock the usePathname hook to return a specific path
    const usePathnameMock = vi.spyOn(navigation, 'usePathname');
    usePathnameMock.mockReturnValue('/about');

    render(<DesktopNav navItems={mockNavItems} />);

    // The About link should have the active class
    const aboutLink = screen.getByText('About').closest('a');
    expect(aboutLink).toHaveClass('text-white font-semibold');

    // Other links should not have the active class
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveClass('text-white font-semibold');
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
  });
});
