'use client';

import Image from 'next/image';
import type { User, Favorite, Rating } from '@prisma/client';

interface ProfileContentProps {
  user: User & {
    favorites?: Favorite[];
    ratings?: Rating[];
  };
}

export function ProfileContent({ user }: ProfileContentProps) {
  return (
    <div className='flex flex-col md:flex-row gap-8'>
      {/* Profile image */}
      <div className='flex-shrink-0'>
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={`${user.firstName}'s profile`}
            className='w-32 h-32 rounded-full border-2 border-cyan-400 shadow-md'
            width={128}
            height={128}
          />
        ) : (
          <div className='w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-4xl'>
            {user.firstName?.charAt(0) || user.email.charAt(0)}
          </div>
        )}
      </div>

      {/* Profile details */}
      <div className='flex-grow'>
        <h3 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
          {user.firstName} {user.lastName}
          {user.username && (
            <span className='ml-2 text-sm text-gray-500 dark:text-gray-400'>
              @{user.username}
            </span>
          )}
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='flex flex-col'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Email
              </span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {user.email}
              </span>
            </div>

            <div className='flex flex-col'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Member Since
              </span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex flex-col'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                User ID
              </span>
              <span
                className='font-medium text-gray-900 dark:text-white truncate'
                title={user.id}
              >
                {user.id}
              </span>
            </div>

            <div className='flex flex-col'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Last Updated
              </span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {new Date(user.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
