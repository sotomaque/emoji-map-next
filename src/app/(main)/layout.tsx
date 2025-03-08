import type { Metadata } from 'next';
import { Header } from '../../components/nav/header/Header';
import { Footer } from '../../components/footer/Footer';
import { env } from '../../env';

const isProduction = env.NEXT_PUBLIC_SITE_ENV === 'production';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL!),
  title: {
    template: '%s',
    default: 'Emoji Map',
  },
  robots: !isProduction ? 'noindex, nofollow' : 'index, follow',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className='max-w-full overflow-hidden flex-grow'>{children}</main>
      <Footer />
    </>
  );
}
