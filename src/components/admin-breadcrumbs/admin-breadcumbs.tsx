'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ADMIN_SIDEBAR_DATA } from '@/constants/admin-sitemap';
import type { AdminSidebarItem } from '@/types/admin-sidebar-item';

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Start with the base admin breadcrumb
  const breadcrumbs: AdminSidebarItem[] = [
    {
      title: 'Admin',
      url: '/admin',
      isActive: pathname === '/admin',
    },
  ];

  if (pathSegments.length > 1) {
    // We have additional path segments, need to find matching items
    let currentPath = '';

    // Skip the first segment (admin) as we've already handled it
    for (let i = 1; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      const fullPath = `/admin${currentPath}`;

      // Look through all sections to find matches
      for (const section of ADMIN_SIDEBAR_DATA.navMain) {
        // Check if the section URL matches
        if (section.url === fullPath) {
          breadcrumbs.push({
            title: section.title,
            url: section.url,
            isActive: pathname === section.url,
          });
          break;
        }

        // Check if any item in the section matches
        const matchingItem = section.items?.find(
          (item) => item.url === fullPath
        );
        if (matchingItem) {
          // Add section if not already there
          if (!breadcrumbs.some((crumb) => crumb.title === section.title)) {
            breadcrumbs.push({
              title: section.title,
              url: section.url,
              isActive: false,
            });
          }

          // Add the matching item
          breadcrumbs.push({
            title: matchingItem.title,
            url: matchingItem.url,
            isActive: pathname === matchingItem.url,
          });
          break;
        }
      }
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className='flex items-center'>
            <BreadcrumbItem className='hidden md:block'>
              {index === breadcrumbs.length - 1 || crumb.isActive ? (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.url}>{crumb.title}</BreadcrumbLink>
              )}
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
