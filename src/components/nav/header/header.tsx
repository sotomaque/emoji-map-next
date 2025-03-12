import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import ThemedUserButton from '@/components/auth/themed-user-button';
import { navItems } from '@/constants/routes';
import { DesktopNav } from '../desktop-nav/desktop-nav';
import { Logo } from '../logo/logo';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { ModeToggle } from '../mode-toggle/mode-toggle';

/**
 * Props for the Header component
 * @interface HeaderProps
 * @property {boolean} [showAuth=false] - Whether to show authentication components instead of the logo
 */
interface HeaderProps {
  showAuth?: boolean;
}

/**
 * Header component that displays either a logo or authentication components,
 * along with navigation and theme toggle.
 *
 * @param {HeaderProps} props - Component props
 * @param {boolean} [props.showAuth=false] - When true, displays auth components instead of logo
 * @returns {JSX.Element} Header component
 */
export function Header({ showAuth = false }: HeaderProps) {
  return (
    <header className='sticky top-0 w-full border-border/40 bg-[#34409b] dark:bg-[#34409b] z-50'>
      <div className='container flex items-center justify-between h-16'>
        {showAuth ? (
          <>
            <SignedOut>
              <SignInButton mode='modal'>
                <button className='bg-zinc-950 hover:bg-zinc-900 text-cyan-400 border border-cyan-700 rounded-sm font-mono px-4 py-2 hover:text-cyan-300 hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-200'>
                  [SIGN_IN]
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <ThemedUserButton />
            </SignedIn>
          </>
        ) : (
          <Link href='/' aria-label='Home page' className='py-2'>
            <Logo />
          </Link>
        )}
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
