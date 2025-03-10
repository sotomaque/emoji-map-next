import { describe, expect, it } from 'vitest';
import { isNavItemActive } from './is-nav-item-active';

describe('isNavItemActive', () => {
  it('should return true when href is root and path is root', () => {
    expect(isNavItemActive('/', '/')).toBe(true);
  });

  it('should return false when href is root but path is not root', () => {
    expect(isNavItemActive('/', '/dashboard')).toBe(false);
  });

  it('should return true when path starts with href', () => {
    expect(isNavItemActive('/dashboard', '/dashboard')).toBe(true);
    expect(isNavItemActive('/dashboard', '/dashboard/settings')).toBe(true);
    expect(isNavItemActive('/users', '/users/123')).toBe(true);
  });

  it('should return false when path does not start with href', () => {
    expect(isNavItemActive('/dashboard', '/users')).toBe(false);
    expect(isNavItemActive('/settings', '/dashboard/settings')).toBe(false);
  });

  it('should handle nested routes correctly', () => {
    expect(isNavItemActive('/dashboard', '/dashboard/users/123')).toBe(true);
    expect(isNavItemActive('/dashboard/users', '/dashboard/users/123')).toBe(
      true
    );
    expect(isNavItemActive('/dashboard/settings', '/dashboard/users/123')).toBe(
      false
    );
  });

  it('should handle null path by returning true only for root href', () => {
    expect(isNavItemActive('/', null)).toBe(true);
    expect(isNavItemActive('/dashboard', null)).toBe(false);
    expect(isNavItemActive('/users', null)).toBe(false);
  });

  it('should handle undefined path by returning true only for root href', () => {
    expect(isNavItemActive('/', undefined)).toBe(true);
    expect(isNavItemActive('/dashboard', undefined)).toBe(false);
    expect(isNavItemActive('/users', undefined)).toBe(false);
  });
});
