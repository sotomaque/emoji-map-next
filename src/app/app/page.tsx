import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'App | Emoji Map',
  description: 'Emoji Map application - find places on a map with emoji markers',
};

export default function AppPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <Image
          src="/logo.png"
          alt="Emoji Map Logo"
          width={100}
          height={100}
          className="mx-auto mb-6 rounded-xl shadow-sm"
          style={{ filter: 'drop-shadow(0 0 4px rgba(52, 64, 155, 0.3))' }}
          priority
        />
        <h1 className="text-4xl font-bold mb-4">Emoji Map App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Coming soon! This is where the main application will be.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Placeholder Content</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This is a placeholder page for the Emoji Map application. In the future, this will be replaced with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mb-6">
          <li>Interactive map with emoji markers</li>
          <li>Search functionality for finding places</li>
          <li>Filtering options by category</li>
          <li>Place details with ratings and reviews</li>
          <li>User preferences and saved locations</li>
        </ul>
        <div className="flex justify-center mt-8">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 dark:text-gray-400">Map View Coming Soon</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
} 