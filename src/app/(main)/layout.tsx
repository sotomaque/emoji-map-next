'use client';

import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/nav/header/header';
import { Particles } from '@/components/particles/particles';
import { Footer } from '../../components/footer/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();

  return (
    <>
      <Header showAuth={isSignedIn} />
      <main className='flex-1 flex flex-col'>
        <div className='flex-1 w-full flex items-center justify-center p-4 relative'>
          {/* Cyberpunk background */}
          <div className='absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-800 z-0'>
            {/* Grid overlay */}
            <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] cyberpunk-grid'></div>

            {/* Scanlines */}
            <div className='cyberpunk-scanline opacity-30 dark:opacity-100'></div>
            <div
              className='cyberpunk-scanline opacity-30 dark:opacity-100'
              style={{ top: '30%', animationDelay: '-2s' }}
            ></div>
            <div
              className='cyberpunk-scanline opacity-30 dark:opacity-100'
              style={{ top: '60%', animationDelay: '-5s' }}
            ></div>

            {/* Glowing orbs */}
            <div className='absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl cyberpunk-orb'></div>
            <div
              className='absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl cyberpunk-orb'
              style={{ animationDelay: '-2s' }}
            ></div>
            <div
              className='absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-pink-500/10 dark:bg-pink-500/20 blur-3xl cyberpunk-orb'
              style={{ animationDelay: '-4s' }}
            ></div>

            {/* Particle effect */}
            <Particles />
          </div>

          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
