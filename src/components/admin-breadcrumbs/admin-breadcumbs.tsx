'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ADMIN_SIDEBAR_DATA } from '@/constants/admin-sitemap';
import type {
  AdminSidebarItem,
  AdminSidebarGroup,
} from '@/types/admin-sidebar-item';

// Type guard to check if an item is a group
function isGroup(
  item: AdminSidebarItem | AdminSidebarGroup
): item is AdminSidebarGroup {
  return 'items' in item;
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  // Start with the base admin breadcrumb
  const breadcrumbs: AdminSidebarItem[] = [
    {
      title: 'Admin',
      url: '/admin',
      isActive: pathname === '/admin',
    },
  ];

  // If we're not on the admin home page, find the matching items
  if (pathname !== '/admin') {
    // Look through all sections to find matches
    for (const section of ADMIN_SIDEBAR_DATA.navMain) {
      if (section.url === pathname) {
        breadcrumbs.push({
          title: section.title,
          url: section.url,
          isActive: true,
        });
        break;
      }

      if (isGroup(section) && pathname.startsWith(section.url || '')) {
        // Add the section
        breadcrumbs.push({
          title: section.title,
          url: section.url || '#',
          isActive: false,
        });

        // Look for matching items in the section
        for (const item of section.items) {
          if (isGroup(item)) {
            // Check if any sub-items match
            const matchingSubItem = item.items.find(
              (subItem) => subItem.url === pathname
            );
            if (matchingSubItem) {
              breadcrumbs.push({
                title: item.title,
                url: item.url || '#',
                isActive: false,
              });
              breadcrumbs.push({
                title: matchingSubItem.title,
                url: matchingSubItem.url,
                isActive: true,
              });
              break;
            }
          } else if (item.url === pathname) {
            breadcrumbs.push({
              title: item.title,
              url: item.url,
              isActive: true,
            });
            break;
          }
        }
        break;
      }
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className='flex items-center'>
            <BreadcrumbItem className='hidden md:block'>
              <BreadcrumbLink
                href={crumb.url}
                aria-current={
                  index === breadcrumbs.length - 1 ? 'page' : undefined
                }
                aria-disabled={index === breadcrumbs.length - 1}
              >
                {crumb.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator className='hidden md:block' />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
