'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function TextThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse'></div>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className='px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-1.5'
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className='text-base'>
        {resolvedTheme === 'dark' ? '☀️' : '🌙'}
      </span>
      <span className='hidden sm:inline'>
        {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
