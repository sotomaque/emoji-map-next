import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emoji Map | About',
  description: 'Learn about Emoji Map - Smooth Brain? Smooth Map.',
};

export default function About() {
  return (
    <div className='container mx-auto px-4 py-12 max-w-4xl'>
      <div className='mb-12 text-center'>
        <Image
          src='/logo.png'
          alt='Emoji Map Logo'
          width={120}
          height={120}
          className='mx-auto mb-6 rounded-xl shadow-sm'
          style={{ filter: 'drop-shadow(0 0 4px rgba(52, 64, 155, 0.3))' }}
          priority
        />
        <h1 className='text-4xl font-bold mb-4'>About Emoji Map</h1>
        <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
          Discover places around you with fun emoji markers
        </p>
      </div>

      <div className='prose dark:prose-invert max-w-none'>
        <section className='mb-12'>
          <h2 className='text-2xl font-semibold mb-4'>Our Mission</h2>
          <p>
            Emoji Map was created with a simple mission: to make exploring new
            places more fun and intuitive. We believe that emojis are a
            universal language that can help people quickly identify the types
            of places they&apos;re looking for, regardless of what language they
            speak.
          </p>
          <p className='mt-4'>
            Whether you&apos;re looking for a coffee shop (☕), a restaurant
            (🍽️), or a park (🌳), Emoji Map helps you find what you need with a
            glance at the map.
          </p>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-semibold mb-4'>How It Works</h2>
          <div className='grid md:grid-cols-3 gap-8 mt-6'>
            <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg'>
              <div className='text-4xl mb-4'>🔍</div>
              <h3 className='text-xl font-medium mb-2'>Search</h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Enter your location or allow the app to use your current
                position to find places nearby.
              </p>
            </div>
            <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg'>
              <div className='text-4xl mb-4'>📍</div>
              <h3 className='text-xl font-medium mb-2'>Discover</h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Browse the map to see different types of places represented by
                intuitive emoji markers.
              </p>
            </div>
            <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg'>
              <div className='text-4xl mb-4'>ℹ️</div>
              <h3 className='text-xl font-medium mb-2'>Explore</h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Tap on any emoji to see details about the place, including
                ratings, photos, and reviews.
              </p>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-semibold mb-4'>Our Technology</h2>
          <p>
            Emoji Map is built using modern technologies to provide a fast,
            responsive experience across platforms:
          </p>
          <ul className='list-disc pl-6 mt-4 space-y-2'>
            <li>
              <strong>Web App:</strong> Built with Next.js, TypeScript, and
              Tailwind CSS
            </li>
            <li>
              <strong>iOS App:</strong> Built with Swift and SwiftUI
            </li>
            <li>
              <strong>Google Maps API:</strong> For accurate location data and
              mapping
            </li>
            <li>
              <strong>Google Places API:</strong> To provide detailed
              information about locations
            </li>
          </ul>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-semibold mb-4'>Open Source</h2>
          <p>
            Emoji Map is an open-source project available on multiple platforms.
            We believe in transparency and community collaboration. You can find
            our source code on GitHub and contribute to either the web or iOS
            version of the project.
          </p>
          <div className='mt-6 flex flex-col sm:flex-row gap-4'>
            <Link
              href='https://github.com/sotomaque/emoji-map-next'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'
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
              Web App (Next.js)
            </Link>
            <Link
              href='https://github.com/sotomaque/emoji-map'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
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
              iOS App (Swift)
            </Link>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
          <p>
            Have questions, suggestions, or feedback? We&apos;d love to hear
            from you!
          </p>
          <p className='mt-4'>
            <strong>Email:</strong>{' '}
            <a
              href='mailto:hello@emojimap.com'
              className='text-blue-600 dark:text-blue-400 hover:underline'
            >
              hello@emojimap.com
            </a>
          </p>
        </section>
      </div>

      <div className='mt-12 text-center'>
        <Link
          href='/'
          className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 mr-2'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z'
              clipRule='evenodd'
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
