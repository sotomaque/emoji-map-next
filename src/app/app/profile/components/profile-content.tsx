'use client';

import Image from 'next/image';
import type { User, Favorite } from '@prisma/client';

interface ProfileContentProps {
  user: User & { favorites?: Favorite[] };
}

export default function ProfileContent({ user }: ProfileContentProps) {

  return (
    <div className="space-y-4">
      {user.imageUrl && (
        <div className="flex justify-center">
          <Image
            src={user.imageUrl}
            alt={`${user.firstName}'s profile`}
            className="w-24 h-24 rounded-full border-2 border-cyan-400"
            width={96}
            height={96}
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <span className="text-gray-500 dark:text-gray-400">Name</span>
          <span className="font-medium">{user.firstName} {user.lastName}</span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <span className="text-gray-500 dark:text-gray-400">Email</span>
          <span className="font-medium">{user.email}</span>
        </div>

        {user.username && (
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
            <span className="text-gray-500 dark:text-gray-400">Username</span>
            <span className="font-medium">@{user.username}</span>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <span className="text-gray-500 dark:text-gray-400">Member Since</span>
          <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
} 