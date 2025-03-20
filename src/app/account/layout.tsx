'use client'

import { useUser } from '@clerk/nextjs';
import { Footer } from '@/components/footer/footer';
import { Header } from '@/components/nav/header/header';

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useUser();

  return (
    <>
      <Header
        className='bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-800 border-none'
        showAuth={isSignedIn}
      />
      <main className='flex-1 flex flex-col'>{children}</main>
      <Footer className='bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-800 border-none' />
    </>
  );
}
