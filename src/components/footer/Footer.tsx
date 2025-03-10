'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/constants/routes';
import { isNavItemActive } from '@/utils/nav/is-nav-item-active';
import { useNavItems } from '@/hooks/useNavItems';

export function Footer() {
  const path = usePathname();
  const { filterNavItems } = useNavItems();
  const filteredNavItems = filterNavItems(navItems);

  return (
    <footer className='border-t border-gray-200 dark:border-gray-800'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='mb-4 md:mb-0'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              © {new Date().getFullYear()} Emoji Map. All rights reserved.
            </p>
          </div>
          <div className='flex flex-wrap justify-center gap-6'>
            {filteredNavItems.map((item, index) => {
              const isActive = isNavItemActive(item.href, path);

              return (
                <Link
                  key={`footer-${item.label}-${index}`}
                  href={item.href}
                  target={item.target ? '_blank' : undefined}
                  rel={item.target ? 'noopener noreferrer' : undefined}
                  className={`text-sm ${isActive
                    ? 'text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
