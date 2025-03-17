'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useGateValue } from '@statsig/react-bindings';
import { Particles } from '@/components/particles/particles';
import { FEATURE_FLAGS } from '@/constants/feature-flags';

/**
 * Home Page Component
 *
 * Renders the landing page of the Emoji Map application with:
 * - Logo and title
 * - Brief description of the app
 * - Main call-to-action button to launch the app
 * - Links to API docs and GitHub repositories
 * - Footer with copyright information
 *
 * @returns {JSX.Element} The rendered Home page
 */
export default function Home() {
  const IS_APP_ENABLED = useGateValue(FEATURE_FLAGS.ENABLE_APP);

  return (
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

      {/* Content */}
      <div className='max-w-md w-full mx-auto bg-white/90 dark:bg-card/80 backdrop-blur-md text-card-foreground rounded-lg shadow-lg border border-purple-200 dark:border-white/10 p-6 z-10'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <div className='flex flex-col items-center'>
            <Image
              src='/logo-blur.png'
              alt='Emoji Map Logo'
              width={150}
              height={150}
              className='mb-4 rounded-xl shadow-md'
              style={{
                filter: 'drop-shadow(0 0 8px rgba(52, 64, 155, 0.3))',
              }}
              priority
            />
            <h1 className='text-4xl font-bold'>Emoji Map</h1>
          </div>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-md'>
            Smooth Brain? Smooth Map.
          </p>
        </div>

        {/* Main App Button */}
        {IS_APP_ENABLED && (
          <div className='flex justify-center w-full mt-6'>
            <Link
              href='/app'
              className='inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105'
            >
              <span className='text-2xl mr-2'>🗺️</span> Launch App
            </Link>
          </div>
        )}

        {/* Links */}
        <div className='flex gap-4 items-center flex-wrap justify-center mt-8'>
          <Link
            className='rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5'
            href='/docs'
          >
            <span className='text-xl'>📚</span> API Docs
          </Link>
          <Link
            className='rounded-full border border-solid border-gray-300 dark:border-gray-700 transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5'
            href='https://github.com/sotomaque/emoji-map-next'
            target='_blank'
            rel='noopener noreferrer'
          >
            <svg
              className='w-5 h-5 mr-2'
              viewBox='0 0 24 24'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.418 22 12c0-5.523-4.477-10-10-10z'
              />
            </svg>
            Web App
          </Link>
          <Link
            className='rounded-full border border-solid border-gray-300 dark:border-gray-700 transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5'
            href='https://github.com/sotomaque/emoji-map'
            target='_blank'
            rel='noopener noreferrer'
          >
            <svg
              className='w-5 h-5 mr-2'
              viewBox='0 0 24 24'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.418 22 12c0-5.523-4.477-10-10-10z'
              />
            </svg>
            iOS App
          </Link>
        </div>
      </div>
    </div>
  );
}
