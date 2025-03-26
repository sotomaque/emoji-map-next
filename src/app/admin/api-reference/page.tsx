import Link from 'next/link';

export default function ApiReferencesPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      <h1 className='text-3xl font-bold'>API References</h1>
      <p className='text-muted-foreground'>
        Overview of available API endpoints. Click on a category to see detailed
        documentation for each route.
      </p>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* User API */}
        <ApiSection
          title='User API'
          description='Endpoints for user management and authentication'
          endpoints={[
            {
              name: 'GET /api/user',
              description: 'Get user profile information',
            },
            {
              name: 'POST /api/user',
              description: 'Create or update user profile',
            },
            { name: 'GET /api/user/sync', description: 'Sync user data' },
          ]}
          link='/admin/api-reference/user'
        />

        {/* Places API */}
        <ApiSection
          title='Places API'
          description='Search, manage and interact with places'
          endpoints={[
            { name: '/api/places/search', description: 'Search for places' },
            { name: '/api/places/details', description: 'Get place details' },
            {
              name: '/api/places/favorite',
              description: 'Manage favorite places',
            },
            { name: '/api/places/rating', description: 'Rate places' },
            { name: '/api/places/photos', description: 'Place photos' },
            {
              name: '/api/places/open-ai',
              description: 'AI-powered place features',
            },
          ]}
          link='/admin/api-reference/places'
        />

        {/* Admin API */}
        <ApiSection
          title='Admin API'
          description='Administrative endpoints for system management'
          endpoints={[
            { name: '/api/admin', description: 'Admin controls and settings' },
          ]}
          link='/admin/api-reference/admin'
        />

        {/* Webhooks API */}
        <ApiSection
          title='Webhooks API'
          description='Handle external service webhooks'
          endpoints={[
            { name: '/api/webhooks', description: 'Process webhook events' },
          ]}
          link='/admin/api-reference/webhooks'
        />

        {/* Health API */}
        <ApiSection
          title='Health API'
          description='System health and monitoring'
          endpoints={[
            {
              name: 'GET /api/health',
              description: 'Check system health status',
            },
          ]}
          link='/admin/api-reference/health'
        />

        {/* Debug API */}
        <ApiSection
          title='Debug API'
          description='Debugging tools and utilities'
          endpoints={[
            {
              name: '/api/debug/categories',
              description: 'Debug category information',
            },
          ]}
          link='/admin/api-reference/debug'
        />

        {/* Test Logger API */}
        <ApiSection
          title='Test Logger API'
          description='Testing and logging functionality'
          endpoints={[
            {
              name: '/api/test-logger',
              description: 'Log test events and data',
            },
          ]}
          link='/admin/api-reference/test-logger'
        />
      </div>

      <div className='mt-8 rounded-xl border p-6'>
        <h2 className='text-xl font-semibold mb-4'>API Authentication</h2>
        <p className='mb-2'>
          Most API endpoints require authentication. Use one of the following
          methods:
        </p>
        <ul className='list-disc list-inside space-y-2 ml-4'>
          <li>Session-based authentication (for browser clients)</li>
          <li>
            API key authentication via <code>x-api-key</code> header (for
            server-to-server)
          </li>
          <li>
            OAuth2 token via <code>Authorization: Bearer {'{token}'}</code>{' '}
            header
          </li>
        </ul>
        <div className='mt-6 bg-muted p-4 rounded'>
          <p className='text-sm font-medium'>Need help with our API?</p>
          <p className='text-sm text-muted-foreground'>
            Contact the development team for API integration support or feature
            requests.
          </p>
        </div>
      </div>
    </div>
  );
}

// API documentation section component
interface ApiEndpoint {
  name: string;
  description: string;
}

interface ApiSectionProps {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
  link: string;
}

function ApiSection({ title, description, endpoints, link }: ApiSectionProps) {
  return (
    <div className='rounded-xl border overflow-hidden'>
      <div className='bg-muted/50 p-4'>
        <h2 className='text-xl font-semibold'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      <div className='p-4'>
        <ul className='space-y-2'>
          {endpoints.map((endpoint) => (
            <li key={endpoint.name} className='text-sm'>
              <span className='font-mono text-xs bg-muted px-1.5 py-0.5 rounded'>
                {endpoint.name}
              </span>
              <span className='ml-2 text-muted-foreground'>
                {endpoint.description}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={link}
          className='mt-4 inline-block text-sm font-medium text-primary hover:underline'
        >
          View detailed documentation →
        </Link>
      </div>
    </div>
  );
}
