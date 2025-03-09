'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className='bg-white dark:bg-gray-800 shadow'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>
            Emoji Map
          </Link>

          <div className='flex items-center gap-4'>
            {isSignedIn ? (
              <>
                <Link
                  href='/profile'
                  className='text-blue-600 hover:text-blue-800'
                >
                  Profile
                </Link>
                <UserButton afterSignOutUrl='/' />
              </>
            ) : (
              <>
                <Link
                  href='/sign-in'
                  className='text-blue-600 hover:text-blue-800'
                >
                  Sign In
                </Link>
                <Link
                  href='/sign-up'
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
