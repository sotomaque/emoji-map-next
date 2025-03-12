import { ClerkProvider } from '@clerk/nextjs';
import { Header } from '@/components/nav/header/header';

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
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider >
      <div className='min-h-screen flex flex-col bg-zinc-950 dark:bg-zinc-950 text-cyan-400 dark:text-cyan-400 font-mono bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent)]'>
        <Header showAuth={true} />
        <main className='flex-grow'>{children}</main>
      </div>
    </ClerkProvider>
  );
}
