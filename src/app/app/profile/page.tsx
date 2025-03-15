'use client';

import Link from 'next/link';
import FavoritesTable from './components/favorites-table';
import ProfileContent from './components/profile-content';
import { useUser } from './context/user-context';

export default function ProfilePage() {
  const user = useUser();

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-6'>
      <div className='w-full max-w-4xl p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-cyan-400 dark:border-cyan-800'>
        <h1 className='text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-center'>
          Your Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ProfileContent user={user} />
          </div>

          <div className="md:col-span-2">
            <FavoritesTable favorites={user.favorites} />
          </div>
        </div>

        <div className='pt-4 flex justify-center'>
          <Link
            href='/app'
            className='px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 inline-block'
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
