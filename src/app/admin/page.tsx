'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import {
  ArrowRight,
  Code,
  Database,
  FileText,
  Github,
  Globe,
  Settings,
  Shield,
  Lock,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminPage() {
  const { user } = useUser();
  const isAdmin = Boolean(user?.publicMetadata.admin);

  const handleRequestAccess = () => {
    const userId = user?.id || 'Unknown';
    const email = user?.emailAddresses[0]?.emailAddress || 'Unknown';
    const name =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : email;

    const subject = encodeURIComponent(`Admin Access Request for ${name}`);
    const body = encodeURIComponent(
      `Hello,\n\nI would like to request admin access to the Emoji Map application.\n\n` +
        `User ID: ${userId}\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `Thank you.`
    );

    window.location.href = `mailto:sotomaque@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

      <SignedIn>
        {isAdmin ? (
          <>
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
          </>
        ) : (
          <>
            <div className='max-w-md mx-auto rounded-xl border p-8 text-center'>
              <div className='flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 mx-auto mb-6'>
                <Lock className='w-8 h-8 text-amber-600 dark:text-amber-300' />
              </div>
              <h2 className='text-2xl font-bold mb-2'>Admin Access Required</h2>
              <p className='text-muted-foreground mb-6'>
                This dashboard is restricted to authorized administrators only.
                If you require access to manage Emoji Map resources, please
                submit a request for administrator privileges.
              </p>
              <Button
                onClick={handleRequestAccess}
                className='flex items-center gap-2 mx-auto'
                size='lg'
              >
                <Mail className='w-4 h-4' />
                Request Admin Access
              </Button>
            </div>
          </>
        )}
      </SignedIn>

      <SignedOut>
        <div className='rounded-xl border p-8 text-center max-w-md mx-auto'>
          <Shield className='h-12 w-12 mx-auto mb-4 text-primary' />
          <h2 className='text-2xl font-bold mb-2'>Admin Access Required</h2>
          <p className='text-muted-foreground mb-6'>
            You need to sign in with an admin account to view the admin
            dashboard.
          </p>
          <SignInButton mode='modal'>
            <Button type='button' variant='default'>
              Sign In
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
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
