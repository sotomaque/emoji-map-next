import Link from 'next/link';
import {
  Brush,
  Camera,
  MessageCircle,
  Settings,
  Star,
  TrendingUp,
} from 'lucide-react';
import { FeatureCard } from '@/components/merchant/feature-card';
import { WaitlistDialog } from '@/components/merchant/waitlist-modal';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Become a Merchant - Emoji Map',
  description:
    'Take control of your business presence on Emoji Map. Sign up as a merchant to manage your place, engage with customers, and grow your business.',
};

export default function MerchantPage() {
  return (
    <div className='container max-w-7xl py-12'>
      {/* Hero Section */}
      <div className='text-center space-y-4 mb-16'>
        <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl'>
          Take Control of Your Business on Emoji Map
        </h1>
        <p className='mx-auto max-w-[700px] text-lg text-muted-foreground'>
          Join our platform to enhance your business visibility, engage with
          customers, and manage your online presence effectively.
        </p>
        <div className='flex justify-center gap-4 pt-4'>
          <WaitlistDialog
            trigger={<Button size='lg'>Sign Up as a Merchant</Button>}
          />
          <Link href='/merchant/learn'>
            <Button size='lg' variant='outline'>
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <FeatureCard
          icon={Settings}
          title='Complete Control'
          description='Manage your business profile, update information, and control how your place appears to users.'
        />
        <FeatureCard
          icon={Camera}
          title='Photo Management'
          description='Curate your photo gallery and showcase the best aspects of your business to attract customers.'
        />
        <FeatureCard
          icon={MessageCircle}
          title='Review Management'
          description='Engage with customer reviews, respond to feedback, and build a strong online reputation.'
        />
        <FeatureCard
          icon={TrendingUp}
          title='Analytics & Insights'
          description='Access detailed insights about your page performance and customer engagement.'
        />
        <FeatureCard
          icon={Star}
          title='Special Promotions'
          description='Create and manage special deals and promotions to attract more customers to your business.'
        />
        <FeatureCard
          icon={Brush}
          title='Customization'
          description='Personalize your business page with custom themes and branding elements.'
        />
      </div>

      {/* Call to Action */}
      <div className='mt-16 text-center'>
        <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl mb-4'>
          Ready to Grow Your Business?
        </h2>
        <p className='mx-auto max-w-[600px] text-muted-foreground mb-8'>
          Join thousands of businesses that trust Emoji Map to enhance their
          online presence and connect with customers.
        </p>
        <WaitlistDialog
          trigger={<Button size='lg'>Get Started Today</Button>}
        />
      </div>
    </div>
  );
}
