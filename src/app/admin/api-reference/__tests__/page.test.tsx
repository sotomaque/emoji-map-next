import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ApiReferencesPage from '../page';

describe('ApiReferencesPage', () => {
  it('renders the page title correctly', () => {
    render(<ApiReferencesPage />);
    expect(screen.getByText('API References')).toBeInTheDocument();
    expect(
      screen.getByText(/Overview of available API endpoints/)
    ).toBeInTheDocument();
  });

  it('renders all API section components', () => {
    render(<ApiReferencesPage />);

    // Check that all section titles are rendered
    expect(screen.getByText('User API')).toBeInTheDocument();
    expect(screen.getByText('Places API')).toBeInTheDocument();
    expect(screen.getByText('Admin API')).toBeInTheDocument();
    expect(screen.getByText('Webhooks API')).toBeInTheDocument();
    expect(screen.getByText('Health API')).toBeInTheDocument();
    expect(screen.getByText('Debug API')).toBeInTheDocument();
    expect(screen.getByText('Test Logger API')).toBeInTheDocument();
  });

  it('renders API section descriptions correctly', () => {
    render(<ApiReferencesPage />);

    expect(
      screen.getByText('Endpoints for user management and authentication')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Search, manage and interact with places')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Administrative endpoints for system management')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Handle external service webhooks')
    ).toBeInTheDocument();
    expect(
      screen.getByText('System health and monitoring')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Debugging tools and utilities')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Testing and logging functionality')
    ).toBeInTheDocument();
  });

  it('renders endpoints for each API section', () => {
    render(<ApiReferencesPage />);

    // Check some endpoint examples from different sections
    expect(screen.getByText('GET /api/user')).toBeInTheDocument();
    expect(screen.getByText('POST /api/user')).toBeInTheDocument();
    expect(screen.getByText('/api/places/search')).toBeInTheDocument();
    expect(screen.getByText('/api/places/details')).toBeInTheDocument();
    expect(screen.getByText('/api/admin')).toBeInTheDocument();
    expect(screen.getByText('GET /api/health')).toBeInTheDocument();
  });

  it('renders the API authentication section', () => {
    render(<ApiReferencesPage />);

    expect(screen.getByText('API Authentication')).toBeInTheDocument();
    expect(
      screen.getByText(/Most API endpoints require authentication/)
    ).toBeInTheDocument();

    // Check authentication methods
    expect(
      screen.getByText(/Session-based authentication/)
    ).toBeInTheDocument();
    expect(screen.getByText(/API key authentication/)).toBeInTheDocument();
    expect(screen.getByText(/OAuth2 token/)).toBeInTheDocument();

    // Check help section
    expect(screen.getByText('Need help with our API?')).toBeInTheDocument();
  });

  it('renders links to detailed documentation for each section', () => {
    render(<ApiReferencesPage />);

    const links = screen.getAllByText('View detailed documentation →');
    expect(links).toHaveLength(7); // One for each API section

    // Verify a few specific hrefs
    const userApiLink = screen.getByText('View detailed documentation →', {
      selector: 'a[href="/admin/api-reference/user"]',
    });
    const placesApiLink = screen.getByText('View detailed documentation →', {
      selector: 'a[href="/admin/api-reference/places"]',
    });
    const adminApiLink = screen.getByText('View detailed documentation →', {
      selector: 'a[href="/admin/api-reference/admin"]',
    });

    expect(userApiLink).toBeInTheDocument();
    expect(placesApiLink).toBeInTheDocument();
    expect(adminApiLink).toBeInTheDocument();
  });
});
