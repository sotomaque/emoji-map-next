import ThemedUserButton from '@/components/auth/ThemedUserButton';
import { ModeToggle } from '@/components/nav/mode-toggle/Mode-Toggle';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from '@clerk/nextjs';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <header className='absolute top-0 left-0 right-0 z-50 p-6'>
        <div className='flex justify-between'>
          {/* Profile / Login / Signup */}
          <>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <ThemedUserButton />
            </SignedIn>
          </>

          {/* Dark mode toggle */}
          <ModeToggle
            className={`
          bg-gray-500
          dark:bg-gray-800 dark:hover:bg-gray-700 
          border-none
          rounded-full`}
          />
        </div>
      </header>
      {children}
    </ClerkProvider>
  );
}
