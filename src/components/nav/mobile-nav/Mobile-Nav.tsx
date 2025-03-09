'use client';

import { Button } from '@/components/ui/button';
import { TextAlignRightIcon } from '@radix-ui/react-icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Logo } from '../logo/Logo';
import { isNavItemActive } from '@/utils/nav/is-nav-item-active';
import type { NavItem } from '@/types/nav-items';

function NavLink({
  href,
  label,
  isActive,
  target,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  target?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      target={target ? '_blank' : undefined}
      rel={target ? 'noopener noreferrer' : undefined}
      className={cn(
        isActive ? 'font-bold' : 'font-light',
        'hover:text-decoration-none hover:opacity-50 text-lg'
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function NavItemWithChildren({
  navItem,
  path,
  onClick,
}: {
  navItem: NavItem;
  path: string;
  onClick: () => void;
}) {
  const isActive = isNavItemActive(navItem.href, path);

  return (
    <details className='group'>
      <summary
        className={cn(
          isActive ? 'font-bold' : 'font-light',
          'hover:text-decoration-none hover:opacity-50 text-lg block w-full text-left cursor-pointer transition-all duration-300 ease-in-out'
        )}
      >
        {navItem.label}
      </summary>
      {navItem.children && (
        <ul className='pl-4 mt-2 space-y-2 overflow-hidden max-h-0 opacity-0 transition-all duration-300 ease-in-out group-open:max-h-screen group-open:opacity-100'>
          {navItem.children.map((child, index) => (
            <li
              key={`${child.label}-${index}`}
              className='child-item'
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <NavLink
                href={child.href}
                label={child.label}
                isActive={isNavItemActive(child.href, path)}
                target={child.target}
                onClick={onClick}
              />
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

export function MobileNav({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label='Open Menu'
          variant='ghost'
          className='w-[1.75rem] p-5 focus-visible:ring-1 focus-visible:ring-offset-1 hover:bg-[#2a3480]/10'
        >
          <TextAlignRightIcon className='text-white' />
        </Button>
      </SheetTrigger>
      <SheetContent className='bg-[#34409b] text-white'>
        <SheetHeader>
          <div className='mr-6 ml-auto'>
            <Logo />
          </div>
          <div className='sr-only'>
            <SheetTitle>Main Navigation</SheetTitle>
            <SheetDescription>Navigate to the website pages</SheetDescription>
          </div>
        </SheetHeader>
        <nav className='pt-10 pb-20'>
          <div className='container'>
            <ul className='list-none text-left space-y-3'>
              {navItems
                .filter((navItem) => !navItem.hidden)
                .map((navItem, index) => {
                  const isActive = isNavItemActive(navItem.href, path);

                  return (
                    <li key={`${navItem.label}-${index}`}>
                      {/* If no children, render Link directly */}
                      {navItem.children ? (
                        <NavItemWithChildren
                          navItem={navItem}
                          path={path}
                          onClick={() => setOpen(false)}
                        />
                      ) : (
                        <NavLink
                          href={navItem.href}
                          label={navItem.label}
                          isActive={isActive}
                          target={navItem.target}
                          onClick={() => setOpen(false)}
                        />
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
