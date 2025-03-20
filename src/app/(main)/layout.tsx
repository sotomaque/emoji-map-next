import { Header } from '@/components/nav/header/header';
import { Footer } from '../../components/footer/footer';
import { env } from '../../env';
import type { Metadata } from 'next';

const isProduction = env.NEXT_PUBLIC_SITE_ENV === 'production';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL!),
  title: {
    template: '%s',
    default: 'Emoji Map',
  },
  robots: !isProduction ? 'noindex, nofollow' : 'index, follow',
};

/**
 * Main layout component for the public-facing pages
 *
 * Includes the Header without authentication elements and Footer.
 * Also sets up metadata for SEO.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {JSX.Element} Main layout component
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header
        showAuth={false}
        className='bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-800 border-none'
      />
      <main className='flex-1 flex flex-col'>{children}</main>
      <Footer className=' bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-800 border-none' />
    </>
  );
}
