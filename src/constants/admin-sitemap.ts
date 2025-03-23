import type { AdminSidebarItem } from '@/types/admin-sidebar-item';
import { IOS_GITHUB_REPO, WEB_GITHUB_REPO } from './links';

export const ADMIN_SIDEBAR_DATA: {
  navMain: {
    title: string;
    url: string;
    items: AdminSidebarItem[];
  }[];
} = {
  navMain: [
    {
      title: 'Getting Started',
      url: '#',
      items: [
        {
          title: 'iOS App Github',
          url: IOS_GITHUB_REPO,
          isActive: false,
          target: '_blank',
        },
        {
          title: 'Next.js Github',
          url: WEB_GITHUB_REPO,
          isActive: false,
          target: '_blank',
        },
      ],
    },
    {
      title: 'Running Application Locally',
      url: '/admin/running-application-locally',
      items: [
        {
          title: 'ENV Variables',
          url: '/admin/running-application-locally/env-variables',
          isActive: false,
        },
      ],
    },
    {
      title: 'API Reference',
      url: '/admin/api-reference',
      items: [
        {
          title: 'POST /api/places/search',
          url: '/admin/api-reference/places/search',
          isActive: false,
        },
        {
          title: 'GET /api/places/details',
          url: '/admin/api-reference/places/details',
          isActive: false,
        },
        {
          title: 'GET /api/places/photos',
          url: '/admin/api-reference/places/photos',
          isActive: false,
        },
        {
          title: 'GET /api/user',
          url: '/admin/api-reference/user',
          isActive: false,
        },
        {
          title: 'POST /api/user/sync',
          url: '/admin/api-reference/user/sync',
          isActive: false,
        },
        {
          title: 'POST /api/webhooks',
          url: '#',
          isActive: false,
        },
      ],
    },
    {
      title: 'User Management',
      url: '/admin/user-management',
      items: [
        {
          title: 'Clerk Users',
          url: '/admin/user-management/clerk-users',
          isActive: false,
        },
        {
          title: 'DB Users',
          url: '/admin/user-management/db-users',
          isActive: false,
        },
      ],
    },
    {
      title: 'Services',
      url: '/admin/services',
      items: [
        {
          title: 'Vercel',
          url: '/admin/services/vercel',
          isActive: false,
        },
        {
          title: 'Upstash',
          url: '/admin/services/upstash',
          isActive: false,
        },
        {
          title: 'Supabase',
          url: '/admin/services/supabase',
          isActive: false,
        },
        {
          title: 'Clerk',
          url: '/admin/services/clerk',
          isActive: false,
        },
        {
          title: 'Statsig',
          url: '/admin/services/statsig',
          isActive: false,
        },
        {
          title: 'App Store Connect',
          url: '/admin/services/app-store-connect',
          isActive: false,
        },
        {
          title: 'Google Places API',
          url: '/admin/services/google-places-api',
          isActive: false,
        },
        {
          title: 'AppLaunchpad',
          url: '/admin/services/app-launchpad',
          isActive: false,
        },
      ],
    },
    {
      title: 'Assets',
      url: '#',
      items: [
        {
          title: 'Logo',
          url: '#',
          isActive: false,
        },
        {
          title: 'App Store Assets',
          url: '#',
          isActive: false,
        },
      ],
    },
  ],
};
