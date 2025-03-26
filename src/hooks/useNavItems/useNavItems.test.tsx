import { useGateValue } from '@statsig/react-bindings';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NavItem } from '@/types/nav-items';
import { useNavItems } from './useNavItems';

// Mock the statsig hook
vi.mock('@statsig/react-bindings', () => ({
  useGateValue: vi.fn(),
}));

describe('useNavItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter out hidden nav items', () => {
    // Mock the useGateValue hook to return true for all feature flags
    (useGateValue as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const navItems: NavItem[] = [
      { label: 'Visible', href: '/visible', target: false },
      { label: 'Hidden', href: '/hidden', target: false, hidden: true },
    ];

    const { result } = renderHook(() => useNavItems());

    // Test the shouldShowNavItem function
    expect(result.current.shouldShowNavItem(navItems[0])).toBe(true);
    expect(result.current.shouldShowNavItem(navItems[1])).toBe(false);

    // Test the filterNavItems function
    const filtered = result.current.filterNavItems(navItems);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe('Visible');
  });

  it('should filter out nav items with disabled feature flags', () => {
    // Mock the useGateValue hook to return false for the ENABLE_APP feature flag
    (useGateValue as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const navItems: NavItem[] = [
      { label: 'Home', href: '/', target: false },
      { label: 'App', href: '/app', target: false, featureFlag: 'ENABLE_APP' },
    ];

    const { result } = renderHook(() => useNavItems());

    // Test the shouldShowNavItem function
    expect(result.current.shouldShowNavItem(navItems[0])).toBe(true);
    expect(result.current.shouldShowNavItem(navItems[1])).toBe(false);

    // Test the filterNavItems function
    const filtered = result.current.filterNavItems(navItems);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe('Home');
  });

  it('should show nav items with enabled feature flags', () => {
    // Mock the useGateValue hook to return true for the ENABLE_APP feature flag
    (useGateValue as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const navItems: NavItem[] = [
      { label: 'Home', href: '/', target: false },
      { label: 'App', href: '/app', target: false, featureFlag: 'ENABLE_APP' },
    ];

    const { result } = renderHook(() => useNavItems());

    // Test the shouldShowNavItem function
    expect(result.current.shouldShowNavItem(navItems[0])).toBe(true);
    expect(result.current.shouldShowNavItem(navItems[1])).toBe(true);

    // Test the filterNavItems function
    const filtered = result.current.filterNavItems(navItems);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].label).toBe('Home');
    expect(filtered[1].label).toBe('App');
  });

  it('should handle nav items with unknown feature flags', () => {
    // Mock the useGateValue hook to return true for all feature flags
    (useGateValue as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const navItems: NavItem[] = [
      { label: 'Home', href: '/', target: false },
      {
        label: 'Unknown',
        href: '/unknown',
        target: false,
        // @ts-expect-error Testing with an invalid feature flag
        featureFlag: 'UNKNOWN_FLAG',
      },
    ];

    const { result } = renderHook(() => useNavItems());

    // Test the shouldShowNavItem function
    expect(result.current.shouldShowNavItem(navItems[0])).toBe(true);
    expect(result.current.shouldShowNavItem(navItems[1])).toBe(false);

    // Test the filterNavItems function
    const filtered = result.current.filterNavItems(navItems);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe('Home');
  });

  it('should recursively filter children of nav items', () => {
    // Mock the useGateValue hook to return false for the ENABLE_APP feature flag
    (useGateValue as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const navItems: NavItem[] = [
      {
        label: 'Parent',
        href: '/parent',
        target: false,
        children: [
          { label: 'Child1', href: '/child1', target: false },
          {
            label: 'Child2',
            href: '/child2',
            target: false,
            featureFlag: 'ENABLE_APP',
          },
        ],
      },
    ];

    const { result } = renderHook(() => useNavItems());

    // Test the filterNavItems function
    const filtered = result.current.filterNavItems(navItems);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe('Parent');
    expect(filtered[0].children).toHaveLength(1);
    expect(filtered[0].children?.[0].label).toBe('Child1');
  });
});
