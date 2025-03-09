'use client';

import { UserButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function ThemedUserButton() {
  const { theme } = useTheme();

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: 'h-10 w-10 border-2 border-white dark:border-gray-800',
        },
        baseTheme: theme === 'dark' ? dark : undefined,
      }}
    />
  );
}
