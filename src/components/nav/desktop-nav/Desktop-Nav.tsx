'use client';

import type { NavItem } from '@/src/types/nav-items';
import { isNavItemActive } from '@/src/utils/nav/is-nav-item-active';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

type DesktopNavProps = {
  navItems: NavItem[];
};

export function DesktopNav({ navItems }: DesktopNavProps) {
  const path = usePathname();

  return (
    <nav className='hidden md:flex items-center gap-7 text-white'>
      {navItems
        .filter((navItem) => !navItem.hidden)
        .map((navItem, index) => {
          const isActive = isNavItemActive(navItem.href, path);
          const hasChildren = navItem.children && navItem.children.length > 0;

          return (
            <div
              key={`${navItem.label}-${index}`}
              className='relative group py-3'
            >
              <Link
                href={navItem.href}
                target={navItem.target ? '_blank' : undefined}
                rel={navItem.target ? 'noopener noreferrer' : undefined}
                className={`transition-colors flex items-center gap-1
                ${isActive ? 'text-white font-semibold' : 'text-white/75'}
                ${!isActive && 'hover:text-white/90'}
               text-sm`}
              >
                {navItem.label}
                {hasChildren && (
                  <ChevronDown className='w-4 h-4 ml-1 text-white/75 group-hover:text-white transition-colors' />
                )}
              </Link>

              {hasChildren && (
                <div
                  data-testid='nav-child'
                  className='absolute left-0 mt-2 w-48 bg-[#34409b] dark:bg-[#34409b] shadow-lg rounded-b-lg overflow-hidden z-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-opacity duration-200 delay-150'
                >
                  {navItem.children?.map((child, index) => (
                    <Link
                      key={`${child.label}-${index}`}
                      href={child.href}
                      target={child.target ? '_blank' : undefined}
                      rel={child.target ? 'noopener noreferrer' : undefined}
                      className='block px-4 py-2 text-white/75 hover:text-white hover:bg-[#2a3480] dark:hover:bg-[#2a3480] text-sm transition-colors'
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </nav>
  );
}
