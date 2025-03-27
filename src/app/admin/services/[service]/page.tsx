import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InngestLogo } from '@/components/ui/icons/inngest-logo';
import { SERVICES } from '@/constants/services';

interface ServicePageProps {
  params: {
    service: string;
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  // Need to await params in Next.js App Router
  const { service } = await params;

  // Find the correct service based on the slug
  const matchingService = SERVICES.find(
    (s) => s.href === `/admin/services/${service}`
  );

  // If service doesn't exist, show 404
  if (!matchingService) {
    notFound();
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          {matchingService.title}
        </h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses {matchingService.title} for{' '}
          {matchingService.description.toLowerCase()}.
        </p>
      </div>

      {/* Content */}
      <div className='flex items-center justify-center my-12'>
        <div className='bg-card border rounded-lg shadow-sm p-8 max-w-md w-full'>
          <div className='space-y-6'>
            <div className='flex justify-center'>
              {matchingService.logoComponent === 'InngestLogo' ? (
                <InngestLogo
                  width={120}
                  height={36}
                  inverted={matchingService.darkInvert}
                />
              ) : matchingService.logoUrl ? (
                <Image
                  src={matchingService.logoUrl}
                  alt={`${matchingService.title} Logo`}
                  width={120}
                  height={120}
                  className={matchingService.darkInvert ? 'dark:invert' : ''}
                />
              ) : null}
            </div>

            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-semibold'>
                {matchingService.title}
              </h2>
              <p className='text-muted-foreground'>
                {matchingService.description}
              </p>
            </div>

            <div className='flex flex-col gap-3 pt-2'>
              {matchingService.links.map((link, index) => (
                <Button
                  key={link.title}
                  variant={index === 0 ? 'default' : 'outline'}
                  asChild
                  className='w-full'
                >
                  <Link
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {link.title}
                  </Link>
                </Button>
              ))}
            </div>

            {matchingService.commands &&
              matchingService.commands.length > 0 && (
                <div className='mt-6 space-y-3'>
                  <h3 className='text-sm font-medium'>Commands</h3>
                  <div className='space-y-2'>
                    {matchingService.commands.map((cmd) => (
                      <div key={cmd.title} className='space-y-1.5'>
                        <p className='text-sm text-muted-foreground'>
                          {cmd.title}
                        </p>
                        <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm'>
                          {cmd.command}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return SERVICES.map((service) => {
    const servicePath = service.href.split('/').pop();
    return { service: servicePath };
  });
}
