import Link from 'next/link';
import { Logo } from '../logo/logo';
import { ModeToggle } from '../mode-toggle/mode-toggle';
import { navItems } from '@/constants/routes';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { DesktopNav } from '../desktop-nav/desktop-nav';

export function Header() {
  return (
    <header className='sticky top-0 w-full border-border/40 bg-[#34409b] dark:bg-[#34409b] z-50'>
      <div className='container flex items-center justify-between h-16'>
        <Link href='/' aria-label='Home page' className='py-2'>
          <Logo />
        </Link>
        <div className='hidden xl:flex gap-7 items-center justify-between'>
          <DesktopNav navItems={navItems} />
          <ModeToggle />
        </div>
        <div className='flex items-center xl:hidden'>
          <ModeToggle />
          <MobileNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
