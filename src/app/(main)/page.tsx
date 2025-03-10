'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGateValue } from '@statsig/react-bindings';
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
    <div className='flex flex-col'>
      <div className='flex-1 grid grid-rows-[1fr_auto] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20'>
        <main className='flex flex-col gap-8 items-center'>
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
              Find places on a map with emoji markers
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
              href='/api-docs'
            >
              <span className='text-xl'>📚</span> API Docs
            </Link>
            <a
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
            </a>
            <a
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
            </a>
          </div>
        </main>
        <footer className='flex gap-6 flex-wrap items-center justify-center text-sm text-gray-500 dark:text-gray-400'>
          <span>© {new Date().getFullYear()} Emoji Map</span>
          <span>•</span>
          <a
            className='hover:text-gray-900 dark:hover:text-gray-200'
            href='https://nextjs.org'
            target='_blank'
            rel='noopener noreferrer'
          >
            Built with Next.js
          </a>
        </footer>
      </div>
    </div>
  );
}
