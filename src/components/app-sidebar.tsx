'use client';

import * as React from 'react';
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
import { ModeToggle } from './nav/mode-toggle/mode-toggle';

export const ADMIN_SIDEBAR_DATA = {
  navMain: [
    {
      title: 'Getting Started',
      url: '#',
      items: [
        {
          title: 'iOS App Github',
          url: '#',
          isActive: false,
        },
        {
          title: 'Next.js Github',
          url: '#',
          isActive: false,
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
        {/* Name */}
        <div>{displayName}</div>
      </div>
    </SidebarMenuButton>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

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
            {ADMIN_SIDEBAR_DATA.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className='font-medium'>
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
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
