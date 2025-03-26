import Link from 'next/link';
import { ArrowRight, Image, Shapes } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AssetsPage() {
  return (
    <div className='container mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-8'>
        {/* Header Section */}
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>Assets</h1>
          <p className='text-lg text-muted-foreground'>
            Manage and access all application assets in one place
          </p>
        </div>

        {/* Assets Grid */}
        <div className='grid gap-6 sm:grid-cols-2'>
          {/* App Store Screenshots Card */}
          <AssetCard
            title='App Store Screenshots'
            description='Access and manage App Store screenshots generated with App Launchpad'
            // eslint-disable-next-line jsx-a11y/alt-text
            icon={<Image className='h-5 w-5' />}
            link='/admin/assets/app-store-screenshots'
          />

          {/* Logo Assets Card */}
          <AssetCard
            title='Logo Assets'
            description='Access and download official Emoji Map logo variations'
            icon={<Shapes className='h-5 w-5' />}
            link='/admin/assets/logo'
          />
        </div>

        {/* Asset Management Guidelines */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold tracking-tight'>
            Asset Guidelines
          </h2>
          <ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
            <li>• Keep all assets organized in their respective sections</li>
            <li>
              • Use the latest versions of assets for all marketing materials
            </li>
            <li>• Follow the provided guidelines for each asset type</li>
            <li>• Ensure assets are properly optimized before use</li>
            <li>• Maintain consistent branding across all platforms</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

interface AssetCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

function AssetCard({ title, description, icon, link }: AssetCardProps) {
  return (
    <Card className='group relative overflow-hidden transition-all duration-200 hover:shadow-lg'>
      <Link href={link} className='block p-6'>
        <div className='flex items-start gap-4'>
          <div className='rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/10 transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground'>
            {icon}
          </div>
          <div className='flex-1 space-y-1'>
            <h3 className='font-semibold tracking-tight'>{title}</h3>
            <p className='text-sm text-muted-foreground'>{description}</p>
          </div>
          <ArrowRight className='h-5 w-5 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-1' />
        </div>
      </Link>
    </Card>
  );
}
