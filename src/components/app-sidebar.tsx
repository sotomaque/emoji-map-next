'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { IOS_GITHUB_REPO, WEB_GITHUB_REPO } from '@/constants/links';
import { useIsAdmin } from '@/hooks/use-is-admin/use-is-admin';
import { ModeToggle } from './nav/mode-toggle/mode-toggle';

type SidebarItem = {
  title: string;
  url: string;
  isActive: boolean;
  target?: string;
};

export const ADMIN_SIDEBAR_DATA: {
  navMain: {
    title: string;
    url: string;
    items: SidebarItem[];
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
      url: '#',
      items: [
        {
          title: 'ENV Variables',
          url: '#',
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
      title: 'Services',
      url: '#',
      items: [
        {
          title: 'Vercel',
          url: '#',
          isActive: false,
        },
        {
          title: 'Upstash',
          url: '#',
          isActive: false,
        },
        {
          title: 'Supabase',
          url: '#',
          isActive: false,
        },
        {
          title: 'Clerk',
          url: '#',
          isActive: false,
        },
        {
          title: 'Statsig',
          url: '#',
          isActive: false,
        },
        {
          title: 'Google Places API',
          url: '#',
          isActive: false,
        },
        {
          title: 'AppLaunchpad',
          url: '#',
          isActive: false,
        },
      ],
    },
  ],
};

function WrappedUserButton() {
  const { user } = useUser();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName}`
    : user?.emailAddresses[0].emailAddress;

  return (
    <SidebarMenuButton size='lg' asChild>
      <div className='inline-block'>
        <UserButton />
        {/* Name / Email */}
        <div>{displayName}</div>
      </div>
    </SidebarMenuButton>
  );
}

const SidebarSkeleton = () => {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton>
            <div className='h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded'></div>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {Array.from({ length: 3 }).map((_, j) => (
              <SidebarMenuSubItem key={j}>
                <SidebarMenuSubButton>
                  <div className='h-3 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded'></div>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      ))}
    </>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  return (
    <Sidebar {...props}>
      {/* Header (Replace with Clerk User Component) */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignedIn>
              <WrappedUserButton />
            </SignedIn>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {isAdmin ? (
              ADMIN_SIDEBAR_DATA.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className='font-medium'>
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === item.url}
                          >
                            <Link href={item.url} target={item?.target}>
                              {item.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))
            ) : (
              <SidebarSkeleton />
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ModeToggle
          className='border-stone-600 dark:border-stone-200 border-2'
          overrideIconColor='text-gray-500 dark:text-white'
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
