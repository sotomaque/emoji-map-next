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
import { ADMIN_SIDEBAR_DATA } from '@/constants/admin-sitemap';
import { useIsAdmin } from '@/hooks/use-is-admin/use-is-admin';
import { ModeToggle } from './nav/mode-toggle/mode-toggle';

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
        <ModeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
