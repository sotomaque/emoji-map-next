import Image from 'next/image';
import Link from 'next/link';

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
        <ServiceCard
          title='Vercel'
          description='Deployments, previews and hosting'
          href='/admin/services/vercel'
          logoUrl='https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png'
          darkInvert={true}
        />
        <ServiceCard
          title='Supabase'
          description='Database and backend services'
          href='/admin/services/supabase'
          logoUrl='/services/supabase.png'
        />
        <ServiceCard
          title='Clerk'
          description='Authentication and user management'
          href='/admin/services/clerk'
          logoUrl='https://clerk.com/_next/image?url=%2Fimages%2Fclerk-logo.svg&w=96&q=75'
        />
        <ServiceCard
          title='Upstash'
          description='Serverless Redis'
          href='/admin/services/upstash'
          logoUrl='/services/upstash.png'
        />
        <ServiceCard
          title='Statsig'
          description='Feature flags'
          href='/admin/services/statsig'
          logoUrl='/services/statsig.png'
        />
        <ServiceCard
          title='Google Places API'
          description='Location data and mapping services'
          href='/admin/services/google-places-api'
          logoUrl='https://developers.google.com/static/maps/images/maps-icon.svg'
        />
        <ServiceCard
          title='App Store Connect'
          description='iOS app distribution'
          href='/admin/services/app-store-connect'
          logoUrl='https://developer.apple.com/assets/elements/icons/app-store-connect/app-store-connect-96x96.png'
        />
        <ServiceCard
          title='App Launchpad'
          description='App Store screenshots'
          href='/admin/services/app-launchpad'
          logoUrl='/services/app-launchpad.png'
        />
        <ServiceCard
          title='Zoho'
          description='Email'
          href='/admin/services/zoho'
          logoUrl='/services/zoho.png'
        />
        <ServiceCard
          title='Linear'
          description='Project management'
          href='/admin/services/linear'
          logoUrl='/services/linear.png'
        />
      </div>
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  logoUrl?: string;
  darkInvert?: boolean;
}

function ServiceCard({
  title,
  description,
  href,
  logoUrl,
  darkInvert = false,
}: ServiceCardProps) {
  return (
    <Link href={href} className='block h-full'>
      <div className='bg-card border rounded-lg shadow-sm p-6 h-full hover:border-primary/50 transition-colors'>
        <div className='space-y-3'>
          {logoUrl && (
            <div className='flex items-center justify-center h-14 mb-2'>
              <Image
                src={logoUrl}
                alt={`${title} Logo`}
                width={50}
                height={50}
                className={darkInvert ? 'dark:invert' : ''}
              />
            </div>
          )}
          <h2 className='text-xl font-semibold text-center'>{title}</h2>
          <p className='text-muted-foreground text-center'>{description}</p>
        </div>
      </div>
    </Link>
  );
}
