'use client';

import { UserProfile } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export function ThemedUserProfile() {
  const { theme } = useTheme();

  return (
    <UserProfile
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
      }}
    />
  );
}
