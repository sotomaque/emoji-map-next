import { usePathname } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminBreadcrumbs } from './admin-breadcumbs';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock the admin sitemap data
vi.mock('@/constants/admin-sitemap', () => ({
  ADMIN_SIDEBAR_DATA: {
    navMain: [
      {
        title: 'API References',
        url: '/admin/api-reference',
        items: [
          {
            title: 'User API',
            items: [
              {
                title: 'GET /api/user',
                url: '/admin/api-reference/user',
                description: 'Get user profile',
              },
              {
                title: 'POST /api/user/sync',
                url: '/admin/api-reference/user/sync',
                description: 'Sync user data',
              },
            ],
          },
          {
            title: 'Places API',
            items: [
              {
                title: 'GET /api/places/search',
                url: '/admin/api-reference/places/search',
                description: 'Search places',
              },
            ],
          },
        ],
      },
      {
        title: 'Services',
        url: '/admin/services',
        items: [
          {
            title: 'Vercel',
            url: '/admin/services/vercel',
          },
        ],
      },
    ],
  },
}));

describe('AdminBreadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders only Admin breadcrumb when on admin home page', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin');

    render(<AdminBreadcrumbs />);

    // Should only show "Admin" as the current page
    const adminPage = screen.getByRole('link', { current: 'page' });
    expect(adminPage).toHaveTextContent('Admin');
    expect(adminPage).toHaveAttribute('aria-disabled', 'true');

    // Should only have one breadcrumb item
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
  });

  it('renders correct breadcrumbs for a section page', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      '/admin/api-reference'
    );

    render(<AdminBreadcrumbs />);

    // Should show "Admin" as a link and "API References" as the current page
    const adminLink = screen.getByRole('link', { name: 'Admin' });
    expect(adminLink).toHaveAttribute('href', '/admin');

    const apiReferencesPage = screen.getByRole('link', { current: 'page' });
    expect(apiReferencesPage).toHaveTextContent('API References');
    expect(apiReferencesPage).toHaveAttribute('aria-disabled', 'true');

    // Should have two breadcrumb items
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('renders correct breadcrumbs for a nested group page', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      '/admin/api-reference/user'
    );

    render(<AdminBreadcrumbs />);

    // Get all breadcrumb items
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);

    // Check all links in order
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4); // All items are links (3 clickable, 1 current)

    // Check clickable links
    expect(links[0]).toHaveTextContent('Admin');
    expect(links[0]).toHaveAttribute('href', '/admin');

    expect(links[1]).toHaveTextContent('API References');
    expect(links[1]).toHaveAttribute('href', '/admin/api-reference');

    expect(links[2]).toHaveTextContent('User API');
    expect(links[2]).toHaveAttribute('href', '#');

    // Check current page
    expect(links[3]).toHaveTextContent('GET /api/user');
    expect(links[3]).toHaveAttribute('aria-current', 'page');
    expect(links[3]).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders correct breadcrumbs for a deeply nested page', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      '/admin/api-reference/user/sync'
    );

    render(<AdminBreadcrumbs />);

    // Get all breadcrumb items
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);

    // Check all links in order
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4); // All items are links (3 clickable, 1 current)

    // Check clickable links
    expect(links[0]).toHaveTextContent('Admin');
    expect(links[0]).toHaveAttribute('href', '/admin');

    expect(links[1]).toHaveTextContent('API References');
    expect(links[1]).toHaveAttribute('href', '/admin/api-reference');

    expect(links[2]).toHaveTextContent('User API');
    expect(links[2]).toHaveAttribute('href', '#');

    // Check current page
    expect(links[3]).toHaveTextContent('POST /api/user/sync');
    expect(links[3]).toHaveAttribute('aria-current', 'page');
    expect(links[3]).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders only Admin for unknown paths', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      '/admin/unknown-path'
    );

    render(<AdminBreadcrumbs />);

    // Should only show "Admin" as current page
    const adminPage = screen.getByRole('link', { current: 'page' });
    expect(adminPage).toHaveTextContent('Admin');
    expect(adminPage).toHaveAttribute('aria-disabled', 'true');

    // Should only have one breadcrumb item
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);

    // Should only have one link (the current page)
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('aria-disabled', 'true');
  });
});
