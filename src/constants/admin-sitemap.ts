import type { AdminSidebarItem } from '@/types/admin-sidebar-item';
import { IOS_GITHUB_REPO, WEB_GITHUB_REPO } from './links';
import { SERVICES } from './services';

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
      url: '/admin/getting-started',
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
      title: 'App Store Trends',
      url: '/admin/app-store-trends',
      items: [
        {
          title: 'Reports',
          url: '/admin/app-store-trends/reports',
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
          url: '/admin/api-reference/webhooks',
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
      items: SERVICES.map((service) => ({
        title: service.title,
        url: service.href,
        isActive: false,
      })),
    },
    {
      title: 'Assets',
      url: '/admin/assets',
      items: [
        {
          title: 'Logo',
          url: '/admin/assets/logo',
          isActive: false,
        },
        {
          title: 'App Store Assets',
          url: '/admin/assets/app-store-screenshots',
          isActive: false,
        },
      ],
    },
  ],
};
