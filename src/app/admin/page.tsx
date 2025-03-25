import Link from 'next/link';
import {
  ArrowRight,
  Code,
  Database,
  FileText,
  Github,
  Globe,
  Settings,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* API Documentation Card */}
        <DashboardCard
          title='API Reference'
          description='Explore and understand all available API endpoints'
          icon={<Code className='h-5 w-5' />}
          link='/admin/api-reference'
        />

        {/* Services Overview Card */}
        <DashboardCard
          title='Services'
          description='Monitor and manage all connected services'
          icon={<Globe className='h-5 w-5' />}
          link='/admin/services'
        />

        {/* Repositories Card */}
        <DashboardCard
          title='Repositories'
          description='Access source code and development resources'
          icon={<Github className='h-5 w-5' />}
          link='/admin/repositories'
        />

        {/* Database Management Card */}
        <DashboardCard
          title='Database'
          description='Manage database connections and data'
          icon={<Database className='h-5 w-5' />}
          link='/admin/database'
        />

        {/* Documentation Card */}
        <DashboardCard
          title='Documentation'
          description='View technical documentation and guides'
          icon={<FileText className='h-5 w-5' />}
          link='/admin/documentation'
        />

        {/* Settings Card */}
        <DashboardCard
          title='Settings'
          description='Configure system and application settings'
          icon={<Settings className='h-5 w-5' />}
          link='/admin/settings'
        />
      </div>

      <div className='mt-6 rounded-xl border p-6'>
        <h2 className='text-xl font-semibold mb-4'>System Status</h2>
        <div className='grid gap-4 md:grid-cols-3'>
          <StatusItem label='API' status='healthy' />
          <StatusItem label='Database' status='healthy' />
          <StatusItem label='Auth Service' status='healthy' />
          <StatusItem
            label='Storage'
            status='warning'
            message='80% capacity used'
          />
          <StatusItem label='Search Engine' status='healthy' />
          <StatusItem label='Background Tasks' status='healthy' />
        </div>
        <div className='mt-6 text-sm text-muted-foreground'>
          Last checked: {new Date().toLocaleString()}
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
    <Card className='overflow-hidden transition-all hover:shadow-md'>
      <Link href={link} className='block p-6'>
        <div className='flex items-start gap-4'>
          <div className='rounded-lg bg-primary/10 p-2 text-primary'>
            {icon}
          </div>
          <div className='flex-1'>
            <h3 className='font-medium'>{title}</h3>
            <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
          </div>
          <ArrowRight className='h-5 w-5 text-muted-foreground/50' />
        </div>
      </Link>
    </Card>
  );
}

interface StatusItemProps {
  label: string;
  status: 'healthy' | 'warning' | 'error';
  message?: string;
}

function StatusItem({ label, status, message }: StatusItemProps) {
  const statusColors = {
    healthy: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  return (
    <div className='flex items-center justify-between rounded-md border p-3'>
      <span className='font-medium'>{label}</span>
      <div className='flex items-center gap-2'>
        {message && (
          <span className='text-xs text-muted-foreground'>{message}</span>
        )}
        <span className={`relative flex h-3 w-3 ${statusColors[status]}`}>
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusColors[status]} opacity-75`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${statusColors[status]}`}
          ></span>
        </span>
      </div>
    </div>
  );
}
