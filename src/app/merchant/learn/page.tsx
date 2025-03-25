import Link from 'next/link';
import {
  ChevronRight,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  Share2,
} from 'lucide-react';
import { FeatureCard } from '@/components/merchant/feature-card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Why Emoji Map for Business? - Modern Discovery Platform',
  description:
    'Connect with Gen Z and Millennial customers where they actually are. Emoji Map is the modern way for businesses to reach young, experience-seeking audiences.',
};

export default function LearnMorePage() {
  return (
    <div className='container max-w-7xl py-12 space-y-24'>
      {/* Hero Section */}
      <div className='text-center space-y-4'>
        <div className='flex items-center justify-center gap-2 text-primary'>
          <Sparkles className='h-5 w-5' />
          <span className='text-sm font-medium'>
            The Future of Local Discovery
          </span>
        </div>
        <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl'>
          Where Young Customers
          <br />
          Actually Hang Out
        </h1>
        <p className='mx-auto max-w-[700px] text-xl text-muted-foreground'>
          Forget outdated platforms. Connect with Gen Z and Millennials who use
          emojis to discover their next favorite spots.
        </p>
      </div>

      {/* Stats Section */}
      <div className='grid gap-8 sm:grid-cols-3'>
        <div className='text-center space-y-2'>
          <div className='text-4xl font-bold text-primary'>73%</div>
          <p className='text-muted-foreground'>
            of Gen Z use emoji-based communication daily
          </p>
        </div>
        <div className='text-center space-y-2'>
          <div className='text-4xl font-bold text-primary'>2.5x</div>
          <p className='text-muted-foreground'>
            higher engagement than traditional review platforms
          </p>
        </div>
        <div className='text-center space-y-2'>
          <div className='text-4xl font-bold text-primary'>92%</div>
          <p className='text-muted-foreground'>of users aged 18-35</p>
        </div>
      </div>

      {/* Why Us Section */}
      <div className='space-y-12'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl'>
            Why Emoji Map?
          </h2>
          <p className='mt-4 text-muted-foreground max-w-[600px] mx-auto'>
            Traditional platforms are losing young customers. Here&apos;s why
            Emoji Map is different.
          </p>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          <FeatureCard
            icon={Target}
            title='Younger Audience'
            description='Reach Gen Z and Millennials who avoid traditional review platforms and prefer quick, visual decision-making.'
          />
          <FeatureCard
            icon={MessageSquare}
            title='Modern Communication'
            description='Connect through emojis - the universal language of the younger generation. No more lengthy reviews.'
          />
          <FeatureCard
            icon={TrendingUp}
            title='Trend-Driven'
            description='Stay ahead with real-time trends and insights about what young customers actually want.'
          />
          <FeatureCard
            icon={Zap}
            title='Quick Decisions'
            description='Perfect for spontaneous Gen Z customers who make instant decisions based on vibes and quick impressions.'
          />
          <FeatureCard
            icon={Users}
            title='Social First'
            description='Built for sharing and social discovery, the way young people actually find new places to visit.'
          />
          <FeatureCard
            icon={Share2}
            title='Viral Growth'
            description='Leverage organic sharing and word-of-mouth marketing through our emoji-first platform.'
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className='text-center space-y-6 pb-12'>
        <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl'>
          Ready to Connect with the Next Generation?
        </h2>
        <p className='text-muted-foreground max-w-[600px] mx-auto'>
          Join Emoji Map and start reaching young customers where they are. No
          more hoping they&apos;ll find you on outdated platforms.
        </p>
        <div className='flex justify-center gap-4'>
          <Link href='/merchant'>
            <Button size='lg'>
              Get Started
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
