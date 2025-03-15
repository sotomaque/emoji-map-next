'use client';

import { createContext, useContext, useState } from 'react';
import type { User, Favorite } from '@prisma/client';

// Define the context type with both user data and setter function
interface UserContextType {
  userData: (User & { favorites?: Favorite[] }) | null;
  updateUser: (updates: Partial<User & { favorites?: Favorite[] }>) => void;
}

// Create a context for the user data
const UserContext = createContext<UserContextType | null>(null);

// Provider component
export function UserProvider({
  user,
  children,
}: {
  user: (User & { favorites?: Favorite[] }) | null;
  children: React.ReactNode;
}) {
  // Use state to store the user data so it can be updated
  const [userData, setUserData] = useState<
    (User & { favorites?: Favorite[] }) | null
  >(user);

  // Function to update user data
  const updateUser = (updates: Partial<User & { favorites?: Favorite[] }>) => {
    setUserData((prevUserData) =>
      prevUserData ? { ...prevUserData, ...updates } : null
    );
  };

  return (
    <UserContext.Provider value={{ userData, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the user data
export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

// Helper hook to directly access user data
export function useUserData() {
  const { userData } = useUser();

  if (!userData) {
    throw new Error('User data is not available');
  }

  return userData;
}

// Helper hook to update favorites
export function useUpdateFavorites() {
  const { userData, updateUser } = useUser();

  const addFavorite = (favorite: Favorite) => {
    const currentFavorites = userData?.favorites || [];
    // Check if the favorite already exists
    if (!currentFavorites.some((fav) => fav.placeId === favorite.placeId)) {
      updateUser({
        favorites: [...currentFavorites, favorite],
      });
    }
  };

  const removeFavorite = (placeId: string) => {
    const currentFavorites = userData?.favorites || [];
    updateUser({
      favorites: currentFavorites.filter((fav) => fav.placeId !== placeId),
    });
  };

  return { addFavorite, removeFavorite };
}
