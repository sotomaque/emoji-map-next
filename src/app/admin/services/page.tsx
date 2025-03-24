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
          logoUrl='/services/vercel.png'
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
          logoUrl='/services/clerk.svg'
          darkInvert={true}
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
          darkInvert={true}
        />
        <ServiceCard
          title='Google Places API'
          description='Location data and mapping services'
          href='/admin/services/google-places-api'
          logoUrl='/services/google-places-api.svg'
        />
        <ServiceCard
          title='App Store Connect'
          description='iOS app distribution'
          href='/admin/services/app-store-connect'
          logoUrl='/services/app-store-connect.png'
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
          darkInvert={true}
        />
        <ServiceCard
          title='Postman'
          description='API testing'
          href='/admin/services/postman'
          logoUrl='/services/postman.png'
        />
        <ServiceCard
          title='Slack'
          description='Communication'
          href='/admin/services/slack'
          logoUrl='/services/slack.png'
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
