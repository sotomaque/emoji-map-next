import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Header } from '@/components/nav/header/header';
import { getCurrentUser } from './actions';
import { AuthRequiredSection } from './components/auth-required-section';
import { UserProvider } from './context/user-context';

/**
 * Layout component for the app section
 *
 * Wraps the app section in a ClerkProvider for authentication
 * and uses the Header component with authentication elements.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {JSX.Element} App layout component
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className='min-h-screen flex flex-col bg-zinc-950 dark:bg-zinc-950 text-cyan-400 dark:text-cyan-400 font-mono bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent)]'>
      <Header showAuth={true} />
      <SignedIn>
        <UserProvider user={user}>
          <main className='flex-grow'>{children}</main>
        </UserProvider>
      </SignedIn>
      <SignedOut>
        <AuthRequiredSection />
      </SignedOut>
    </div>
  );
}
