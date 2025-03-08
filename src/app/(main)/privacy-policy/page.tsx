import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Emoji Map',
  description: 'Privacy policy for the Emoji Map application',
};

export default function PrivacyPolicy() {
  return (
    <div className='container mx-auto px-4 py-12 max-w-4xl'>
      <div className='mb-8'>
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
              <strong>Search History:</strong> We may store your search queries
              to improve our service and provide better recommendations. This
              data is associated with an anonymous identifier, not your personal
              identity.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect information about how you
              interact with our application, such as the features you use and
              the time spent on different pages.
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>How We Use Your Data</h2>
          <p>We use the collected data for various purposes:</p>
          <ul className='list-disc pl-6 mt-2 space-y-2'>
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>
              To gather analysis or valuable information so that we can improve
              our service
            </li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Third-Party Services</h2>
          <p>
            Emoji Map uses the Google Places API to provide location-based
            services. When you use these features, your data is also subject to
            Google&apos;s privacy policies. We encourage you to review
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
            We value your trust in providing us your personal information, thus
            we are striving to use commercially acceptable means of protecting
            it. But remember that no method of transmission over the internet,
            or method of electronic storage is 100% secure and reliable, and we
            cannot guarantee its absolute security.
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
            and updating the &ldquo;Last updated&rdquo; date at the top of this
            page.
          </p>
          <p className='mt-2'>
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul className='list-disc pl-6 mt-2'>
            <li>By email: privacy@emojimap.com</li>
          </ul>
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
