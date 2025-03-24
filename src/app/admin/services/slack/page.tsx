import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SLACK_INVITE_LINK, SLACK_WORKSPACE } from '@/constants/links';
import { cn } from '@/lib/utils';

export default function SlackPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Slack</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses Slack for communication.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <Image
                src='/services/slack.png'
                alt='Slack Logo'
                width={120}
                height={120}
              />
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>Slack</h2>
              <p className='text-muted-foreground'>
                Access Slack or request additional permissions
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              <Link
                href={SLACK_INVITE_LINK}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button
                  className={cn(
                    'w-full bg-black text-white hover:bg-black/90',
                    'dark:bg-white dark:text-black dark:hover:bg-white/90'
                  )}
                >
                  Join Slack
                </Button>
              </Link>
              <Button variant='outline' asChild className='w-full'>
                <Link
                  href={SLACK_WORKSPACE}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  View Slack Workspace
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
