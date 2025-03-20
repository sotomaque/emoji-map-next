import { usePathname } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminBreadcrumbs } from './admin-breadcumbs';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Create a mocked version of ADMIN_SIDEBAR_DATA
vi.mock('@/components/app-sidebar', () => ({
  ADMIN_SIDEBAR_DATA: {
    navMain: [
      {
        title: 'API Reference',
        url: '/admin/api-reference',
        items: [
          {
            title: 'POST /api/places/search',
            url: '/admin/api-reference/places/search',
            isActive: false,
          },
          {
            title: 'GET /api/user',
            url: '/admin/api-reference/user',
            isActive: false,
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
            isActive: false,
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
    // Mock the pathname to be the admin home page
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin');

    render(<AdminBreadcrumbs />);

    // Should only show "Admin" as a page (not a clickable link)
    const adminCrumb = screen.getByText('Admin');
    expect(adminCrumb).toBeInTheDocument();
    expect(adminCrumb.closest('nav')).toHaveTextContent('Admin');

    // Admin should be rendered with aria-current="page" to indicate it's the current page
    const currentPageElement = screen.getByRole('link', { current: 'page' });
    expect(currentPageElement).toHaveTextContent('Admin');
    expect(currentPageElement).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders correct breadcrumbs for a section page', () => {
    // Mock the pathname to be the API Reference page
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      '/admin/api-reference'
    );

    render(<AdminBreadcrumbs />);

    // Should show "Admin" as a link
    const adminLink = screen.getByText('Admin', { selector: 'a' });
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin');

    // API Reference should be rendered with aria-current="page"
    const currentPageElement = screen.getByRole('link', { current: 'page' });
    expect(currentPageElement).toHaveTextContent('API Reference');
    expect(currentPageElement).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders correct breadcrumbs for a nested page', () => {
    // Mock the pathname to be a nested page
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      '/admin/api-reference/user'
    );

    render(<AdminBreadcrumbs />);

    // Should show "Admin" -> "API Reference" -> "GET /api/user"
    const adminLink = screen.getByText('Admin', { selector: 'a' });
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin');

    const apiRefLink = screen.getByText('API Reference', { selector: 'a' });
    expect(apiRefLink).toBeInTheDocument();
    expect(apiRefLink).toHaveAttribute('href', '/admin/api-reference');

    // User API page should be rendered with aria-current="page"
    const currentPageElement = screen.getByRole('link', { current: 'page' });
    expect(currentPageElement).toHaveTextContent('GET /api/user');
    expect(currentPageElement).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders only Admin for unknown paths', () => {
    // Mock the pathname to be an unknown path
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      '/admin/unknown-path'
    );

    render(<AdminBreadcrumbs />);

    // For unknown paths, Admin is rendered as a current page (span with role="link")
    const adminElement = screen.getByText('Admin');
    expect(adminElement).toBeInTheDocument();
    expect(adminElement).toHaveAttribute('aria-current', 'page');
    expect(adminElement).toHaveAttribute('aria-disabled', 'true');

    // There should only be one breadcrumb item
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(1);
  });
});
