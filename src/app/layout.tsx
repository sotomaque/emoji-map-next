import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { Header } from '../components/nav/header/Header';
import { Footer } from '../components/footer/Footer';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '../lib/utils';
import { env } from '../env';

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
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className='max-w-full overflow-hidden flex-grow'>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
