import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IOS_GITHUB_REPO, WEB_GITHUB_REPO } from '@/constants/links';

export default function GettingStartedPage() {
  return (
    <div className='container mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-8'>
        {/* Header Section */}
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>Getting Started</h1>
          <p className='text-lg text-muted-foreground'>
            Access and set up the Emoji Map repositories
          </p>
        </div>

        {/* Repository Cards */}
        <div className='grid gap-6 sm:grid-cols-2'>
          {/* Web App Repository */}
          <RepositoryCard
            title='Web Application'
            description='Next.js web application with admin dashboard and user interface.'
            repoUrl={WEB_GITHUB_REPO}
            techStack={['Next.js', 'TypeScript', 'Tailwind CSS', 'Shadcn UI']}
          />

          {/* iOS App Repository */}
          <RepositoryCard
            title='iOS Application'
            description='Native iOS application for emoji mapping and interaction.'
            repoUrl={IOS_GITHUB_REPO}
            techStack={['Swift', 'SwiftUI', 'MapKit']}
          />
        </div>

        {/* Setup Instructions */}
        <div className='mt-8 space-y-6'>
          <h2 className='text-2xl font-semibold tracking-tight'>Quick Setup</h2>

          <div className='space-y-4'>
            <Card className='p-6'>
              <h3 className='text-lg font-medium'>Web Application Setup</h3>
              <div className='mt-4 space-y-2 font-mono text-sm text-muted-foreground'>
                <p>1. Clone the repository</p>
                <code className='block rounded-md bg-muted p-4'>
                  git clone {WEB_GITHUB_REPO}.git
                </code>
                <p>2. Install dependencies</p>
                <code className='block rounded-md bg-muted p-4'>
                  cd emoji-map-next
                  <br />
                  pnpm install
                </code>
                <p>3. Start the development server</p>
                <code className='block rounded-md bg-muted p-4'>pnpm dev</code>
              </div>
            </Card>

            <Card className='p-6'>
              <h3 className='text-lg font-medium'>iOS Application Setup</h3>
              <div className='mt-4 space-y-2 font-mono text-sm text-muted-foreground'>
                <p>1. Clone the repository</p>
                <code className='block rounded-md bg-muted p-4'>
                  git clone {IOS_GITHUB_REPO}.git
                </code>
                <p>2. Open in Xcode</p>
                <code className='block rounded-md bg-muted p-4'>
                  cd emoji-map
                  <br />
                  open EmojiMap.xcodeproj
                </code>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Resources */}
        <div className='mt-8'>
          <h2 className='mb-4 text-2xl font-semibold tracking-tight'>
            Additional Resources
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <Link href='/admin/running-application' className='block'>
              <Card className='h-full p-6 transition-all hover:shadow-md'>
                <h3 className='font-medium'>Local Development Guide</h3>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Detailed instructions for running the application locally
                </p>
              </Card>
            </Link>
            <Link href='/admin/api-reference' className='block'>
              <Card className='h-full p-6 transition-all hover:shadow-md'>
                <h3 className='font-medium'>API Documentation</h3>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Complete API reference and usage examples
                </p>
              </Card>
            </Link>
            <Link href='/admin/services' className='block'>
              <Card className='h-full p-6 transition-all hover:shadow-md'>
                <h3 className='font-medium'>Services Overview</h3>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Information about connected services and integrations
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RepositoryCardProps {
  title: string;
  description: string;
  repoUrl: string;
  techStack: string[];
}

function RepositoryCard({
  title,
  description,
  repoUrl,
  techStack,
}: RepositoryCardProps) {
  return (
    <Card className='flex flex-col p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-1'>
          <h3 className='font-semibold'>{title}</h3>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
        <Button asChild variant='outline' size='icon'>
          <Link href={repoUrl} target='_blank' rel='noopener noreferrer'>
            <Github className='h-4 w-4' />
            <span className='sr-only'>View repository</span>
          </Link>
        </Button>
      </div>
      <div className='mt-4 flex flex-wrap gap-2'>
        {techStack.map((tech) => (
          <span
            key={tech}
            className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
          >
            {tech}
          </span>
        ))}
      </div>
    </Card>
  );
}
