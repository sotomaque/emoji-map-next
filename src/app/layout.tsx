import type { Metadata } from 'next';
import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '../lib/utils';
import { env } from '../env';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Providers } from '@/components/providers/providers';

const isProduction = env.NEXT_PUBLIC_SITE_ENV === 'production';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL!),
  title: {
    template: '%s',
    default: 'Emoji Map',
  },
  robots: !isProduction ? 'noindex, nofollow' : 'index, follow',
};

const fontSans = FontSans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <link rel='icon' href='/favicon.ico' />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased overscroll-none flex flex-col',
          fontSans.variable
        )}
      >
        <Providers>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
