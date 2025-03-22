'use client';
import { SignInButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export function ThemedSignInButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <SignInButton
      mode='modal'
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        elements: {
          footerAction: { display: 'none' },
          socialButtonsRoot: { display: 'none' },
          dividerRow: { display: 'none' },
        },
      }}
    >
      {children}
    </SignInButton>
  );
}
