'use client';

import { render, screen } from '@testing-library/react';
import { ModeToggle } from './mode-toggle';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as nextThemes from 'next-themes';

// Mock the next-themes module
vi.mock('next-themes', () => ({
  useTheme: vi.fn().mockReturnValue({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock the radix-ui icons
vi.mock('@radix-ui/react-icons', () => ({
  MoonIcon: () => <span data-testid='moon-icon'>🌙</span>,
  SunIcon: () => <span data-testid='sun-icon'>☀️</span>,
  CheckIcon: () => <span data-testid='check-icon'>✓</span>,
  DesktopIcon: () => <span data-testid='desktop-icon'>💻</span>,
}));

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{ className?: string }>) => (
    <button className={className} {...props} data-testid='theme-toggle-button'>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => {
  let dropdownOpen = false;
  let dropdownOnOpenChange: ((open: boolean) => void) | undefined;

  return {
    DropdownMenu: ({
      children,
      open,
      onOpenChange,
    }: React.PropsWithChildren<{
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }>) => {
      dropdownOpen = open ?? false;
      dropdownOnOpenChange = onOpenChange;
      return (
        <div data-testid='dropdown-menu' data-open={open}>
          {children}
        </div>
      );
    },
    DropdownMenuTrigger: ({
      children,
      asChild,
    }: React.PropsWithChildren<{ asChild?: boolean }>) => (
      <div
        data-testid='dropdown-trigger'
        data-aschild={asChild}
        onClick={() =>
          dropdownOnOpenChange && dropdownOnOpenChange(!dropdownOpen)
        }
      >
        {children}
      </div>
    ),
    DropdownMenuContent: ({
      children,
      align,
      className,
    }: React.PropsWithChildren<{ align?: string; className?: string }>) => (
      <div
        data-testid='dropdown-content'
        data-align={align}
        className={className}
      >
        {children}
      </div>
    ),
    DropdownMenuItem: ({
      children,
      onClick,
      disabled,
      className,
    }: React.PropsWithChildren<{
      onClick?: () => void;
      disabled?: boolean;
      className?: string;
    }>) => (
      <div
        data-testid='dropdown-item'
        data-disabled={disabled}
        className={className}
        onClick={onClick}
      >
        {children}
      </div>
    ),
  };
});

// Mock the utility function
vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('ModeToggle', () => {
  const mockSetTheme = vi.fn();
  let mockTheme = 'light';

  beforeEach(() => {
    vi.resetAllMocks();

    // Update the mock implementation for useTheme
    vi.spyOn(nextThemes, 'useTheme').mockReturnValue({
      theme: mockTheme,
      systemTheme: undefined,
      themes: [],
      forcedTheme: undefined,
      resolvedTheme: undefined,
      setTheme: mockSetTheme,
    });
  });

  it('renders the theme toggle button with icons', () => {
    render(<ModeToggle />);

    const toggleButton = screen.getByTestId('theme-toggle-button');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveClass('hover:bg-primary/10');

    // Icons should be rendered - using getAllByTestId since there are multiple sun icons
    const sunIcons = screen.getAllByTestId('sun-icon');
    expect(sunIcons.length).toBeGreaterThan(0);

    const moonIcons = screen.getAllByTestId('moon-icon');
    expect(moonIcons.length).toBeGreaterThan(0);

    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('renders the dropdown content with theme options', () => {
    render(<ModeToggle />);

    const dropdownContent = screen.getByTestId('dropdown-content');
    expect(dropdownContent).toBeInTheDocument();

    // Theme options should be rendered
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();

    // Icons should be rendered
    expect(screen.getAllByTestId('sun-icon')).toHaveLength(2); // One in button, one in menu
    expect(screen.getAllByTestId('moon-icon')).toHaveLength(2); // One in button, one in menu
    expect(screen.getByTestId('desktop-icon')).toBeInTheDocument();
  });

  it('marks the current theme as active', () => {
    // Set the mock theme to 'dark'
    mockTheme = 'dark';
    vi.spyOn(nextThemes, 'useTheme').mockReturnValue({
      theme: mockTheme,
      systemTheme: undefined,
      themes: [],
      forcedTheme: undefined,
      resolvedTheme: undefined,
      setTheme: mockSetTheme,
    });

    render(<ModeToggle />);

    // Find all dropdown items
    const dropdownItems = screen.getAllByTestId('dropdown-item');

    // The dark theme item should be disabled (active)
    const darkItem = dropdownItems.find((item) =>
      item.textContent?.includes('Dark')
    );
    expect(darkItem).toHaveAttribute('data-disabled', 'true');

    // The light theme item should not be disabled
    const lightItem = dropdownItems.find((item) =>
      item.textContent?.includes('Light')
    );
    expect(lightItem).not.toHaveAttribute('data-disabled', 'true');
  });
});
