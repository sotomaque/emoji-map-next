'use client';

import { createContext, useContext } from 'react';
import type { User, Favorite } from '@prisma/client';

// Create a context for the user data
const UserContext = createContext<(User & { favorites?: Favorite[] }) | null>(
  null
);

// Provider component
export function UserProvider({
  user,
  children,
}: {
  user: User & { favorites?: Favorite[] };
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// Hook to use the user data
export function useUser() {
  const user = useContext(UserContext);

  if (!user) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return user;
}
