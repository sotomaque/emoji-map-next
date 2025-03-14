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
      <Header showAuth={false} />
      <main className='max-w-full overflow-hidden flex-grow'>{children}</main>
      <Footer />
    </>
  );
}
