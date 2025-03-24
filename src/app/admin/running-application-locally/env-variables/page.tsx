import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
              >
                <Button className='w-full'>
                  View .env.example
                </Button>
              </Link>
              <Button variant="outline" className='w-full'>
                Request Keybase Access
              </Button>
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
