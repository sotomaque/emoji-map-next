'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Particles } from '@/components/particles/particles';
import { CONTACT_EMAIL } from '@/constants/contact';

export default function PrivacyPolicy() {
  return (
    <div className='relative flex-1 w-full flex items-center justify-center p-4'>
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

      <div className='container mx-auto px-4 py-12 max-w-4xl relative z-10 bg-white/90 dark:bg-card/80 backdrop-blur-md rounded-lg shadow-lg border border-purple-200 dark:border-white/10 overflow-y-auto max-h-[90vh]'>
        <div className='mb-8 text-center'>
          <div className='flex justify-center mb-6'>
            <Image
              src='/logo-blur.png'
              alt='Emoji Map Logo'
              width={100}
              height={100}
              className='rounded-xl'
              style={{ filter: 'drop-shadow(0 0 12px rgba(79, 70, 229, 0.4))' }}
              priority
            />
          </div>
          <h1 className='text-3xl font-bold mb-2'>Privacy Policy</h1>
          <p className='text-gray-500 dark:text-gray-400'>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className='prose dark:prose-invert max-w-none'>
          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>Introduction</h2>
            <p>
              Welcome to Emoji Map. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              website and tell you about your privacy rights and how the law
              protects you.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>Data We Collect</h2>
            <p>
              When you use Emoji Map, we may collect the following types of
              information:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-2'>
              <li>
                <strong>Location Data:</strong> With your permission, we collect
                your device&apos;s location to provide nearby place
                recommendations. This data is only used while you are using the
                app and is not stored on our servers.
              </li>
              <li>
                <strong>Search History:</strong> We may store your search
                queries to improve our service and provide better
                recommendations. This data is associated with an anonymous
                identifier, not your personal identity.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect information about how
                you interact with our application, such as the features you use
                and the time spent on different pages.
              </li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>
              How We Use Your Data
            </h2>
            <p>We use the collected data for various purposes:</p>
            <ul className='list-disc pl-6 mt-2 space-y-2'>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>
                To gather analysis or valuable information so that we can
                improve our service
              </li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>
              Third-Party Services
            </h2>
            <p>
              Emoji Map uses the Google Places API to provide location-based
              services. When you use these features, your data is also subject
              to Google&apos;s privacy policies. We encourage you to review
              <Link
                href='https://policies.google.com/privacy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:underline'
              >
                {' '}
                Google&apos;s Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>Data Security</h2>
            <p>
              We value your trust in providing us your personal information,
              thus we are striving to use commercially acceptable means of
              protecting it. But remember that no method of transmission over
              the internet, or method of electronic storage is 100% secure and
              reliable, and we cannot guarantee its absolute security.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal data, including:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-2'>
              <li>
                The right to access, update or delete the information we have on
                you
              </li>
              <li>The right of rectification</li>
              <li>The right to object</li>
              <li>The right of restriction</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &ldquo;Last updated&rdquo; date at the top of
              this page.
            </p>
            <p className='mt-2'>
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <ul className='list-disc pl-6 mt-2'>
              <li>By email: {CONTACT_EMAIL}</li>
            </ul>
          </section>
        </div>

        <div className='mt-12 text-center'>
          <Link
            href='/'
            className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105'
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
    </div>
  );
}
