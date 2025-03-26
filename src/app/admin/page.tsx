import Link from 'next/link';
import {
  ArrowRight,
  Code,
  LineChart,
  Users,
  Globe,
  Terminal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div className='container mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-8'>
        {/* Header Section */}
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>Admin Dashboard</h1>
          <p className='text-lg text-muted-foreground'>
            Manage and monitor your application&apos;s core functionalities
          </p>
        </div>

        {/* Cards Grid */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {/* API Documentation Card */}
          <DashboardCard
            title='API Reference'
            description='Explore and understand all available API endpoints'
            icon={<Code className='h-5 w-5' />}
            link='/admin/api-reference'
          />

          {/* App Store Trends Card */}
          <DashboardCard
            title='App Store Trends'
            description='Monitor and analyze app store performance metrics'
            icon={<LineChart className='h-5 w-5' />}
            link='/admin/app-store-trends'
          />

          {/* Services Overview Card */}
          <DashboardCard
            title='Services'
            description='Monitor and manage all connected services'
            icon={<Globe className='h-5 w-5' />}
            link='/admin/services'
          />

          {/* User Management Card */}
          <DashboardCard
            title='User Management'
            description='Manage user accounts, roles, and permissions'
            icon={<Users className='h-5 w-5' />}
            link='/admin/user-management'
          />

          {/* Local Development Card */}
          <DashboardCard
            title='Local Development'
            description='Guide for running the application locally'
            icon={<Terminal className='h-5 w-5' />}
            link='/admin/running-application-locally'
          />
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

function DashboardCard({ title, description, icon, link }: DashboardCardProps) {
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
