import Link from 'next/link';

export function Footer() {
  return (
    <footer className='border-t border-gray-200 dark:border-gray-800'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='mb-4 md:mb-0'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              © {new Date().getFullYear()} Emoji Map. All rights reserved.
            </p>
          </div>
          <div className='flex flex-wrap justify-center gap-6'>
            <Link
              href='/app'
              className='text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            >
              App
            </Link>
            <Link
              href='/about'
              className='text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            >
              About
            </Link>
            <Link
              href='/privacy-policy'
              className='text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            >
              Privacy Policy
            </Link>
            <Link
              href='https://github.com/sotomaque/emoji-map-next'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            >
              Web App
            </Link>
            <Link
              href='https://github.com/sotomaque/emoji-map'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            >
              iOS App
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
