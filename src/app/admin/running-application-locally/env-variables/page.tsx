import Link from 'next/link';
import { WEB_GITHUB_REPO } from '@/constants/links';

export default function EnvVariablesPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Environment Variables
        </h1>
        <p className='text-muted-foreground max-w-3xl'>
          Environment variables needed to run EmojiMap locally or in production.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <div className='flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-6xl'>
                🔐
              </div>
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>Environment Setup</h2>
              <p className='text-muted-foreground'>
                Check the .env.example file in the repository or request access
                to the production environment variables.
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={`${WEB_GITHUB_REPO}/blob/main/.env.example`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full'
              >
                View .env.example
              </Link>
              <button className='inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full'>
                Request Keybase Access
              </button>
            </div>

            <div className='mt-4 text-sm text-muted-foreground'>
              <p className='text-center'>
                The .env.example file contains all required environment
                variables with placeholders. For production values, request
                access to the Keybase team portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
