'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGateValue } from '@statsig/react-bindings';
import { FEATURE_FLAGS } from '@/constants/feature-flags';

export default function ProfilePage() {
  const router = useRouter();
  const IS_APP_ENABLED = useGateValue(FEATURE_FLAGS.ENABLE_APP);

  // Use useEffect for navigation to avoid "location is not defined" error
  useEffect(() => {
    if (!IS_APP_ENABLED) {
      router.push('/');
    }
  }, [IS_APP_ENABLED, router]);

  if (!IS_APP_ENABLED) {
    return null; // Return null while the redirect happens in useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-cyan-400 dark:border-cyan-800">
        <h1 className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-center">
          Your Profile Page
        </h1>
        <div className="text-center text-gray-600 dark:text-gray-300">
          Profile content will be added here in the future.
        </div>
        <div className="pt-4 text-center">
          <Link
            href="/app"
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 