import Image from 'next/image';
import Link from 'next/link';
import { InngestLogo } from '@/components/ui/icons/inngest-logo';
import { SERVICES } from '@/constants/services';

export default function ServicesPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Services</h1>
        <p className='text-muted-foreground max-w-3xl'>
          EmojiMap uses various third-party services to power different aspects
          of the application. Each service page below provides details about how
          we use the service and direct links to their respective consoles.
        </p>
      </div>

      {/* Services Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6'>
        {SERVICES.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  logoUrl?: string;
  logoComponent?: 'InngestLogo';
  darkInvert?: boolean;
}

function ServiceCard({
  title,
  description,
  href,
  logoUrl,
  logoComponent,
  darkInvert = false,
}: ServiceCardProps) {
  return (
    <Link href={href} className='block h-full'>
      <div className='bg-card border rounded-lg shadow-sm p-6 h-full hover:border-primary/50 transition-colors'>
        <div className='space-y-3'>
          <div className='flex items-center justify-center h-14 mb-2'>
            {logoComponent === 'InngestLogo' ? (
              <InngestLogo width={100} height={30} inverted={darkInvert} />
            ) : logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${title} Logo`}
                width={50}
                height={50}
                className={darkInvert ? 'dark:invert' : ''}
              />
            ) : null}
          </div>
          <h2 className='text-xl font-semibold text-center'>{title}</h2>
          <p className='text-muted-foreground text-center'>{description}</p>
        </div>
      </div>
    </Link>
  );
}
