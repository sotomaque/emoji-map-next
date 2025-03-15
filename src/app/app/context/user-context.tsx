'use client';

import { createContext, useContext, useState } from 'react';
import type { User, Favorite, Rating } from '@prisma/client';

// Define the context type with both user data and setter function
interface UserContextType {
  userData: (User & { favorites?: Favorite[]; ratings?: Rating[] }) | null;
  updateUser: (
    updates: Partial<User & { favorites?: Favorite[]; ratings?: Rating[] }>
  ) => void;
}

// Create a context for the user data
const UserContext = createContext<UserContextType | null>(null);

// Provider component
export function UserProvider({
  user,
  children,
}: {
  user: (User & { favorites?: Favorite[]; ratings?: Rating[] }) | null;
  children: React.ReactNode;
}) {
  // Use state to store the user data so it can be updated
  const [userData, setUserData] = useState<
    (User & { favorites?: Favorite[]; ratings?: Rating[] }) | null
  >(user);

  // Function to update user data
  const updateUser = (
    updates: Partial<User & { favorites?: Favorite[]; ratings?: Rating[] }>
  ) => {
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

// Helper hook to update ratings
export function useUpdateRatings() {
  const { userData, updateUser } = useUser();

  const updateRating = (placeId: string, rating: number) => {
    if (!userData) return;

    const currentRatings = userData.ratings || [];
    const existingRatingIndex = currentRatings.findIndex(
      (r) => r.placeId === placeId
    );

    let updatedRatings;

    // If rating exists
    if (existingRatingIndex !== -1) {
      const existingRating = currentRatings[existingRatingIndex];

      // If the rating is the same, remove it
      if (existingRating.rating === rating) {
        updatedRatings = currentRatings.filter((r) => r.placeId !== placeId);
      } else {
        // If the rating is different, update it
        updatedRatings = [...currentRatings];
        updatedRatings[existingRatingIndex] = {
          ...existingRating,
          rating,
          updatedAt: new Date(),
        };
      }
    } else {
      // If rating doesn't exist, add it
      updatedRatings = [
        ...currentRatings,
        {
          id: `temp_${Date.now()}`, // Temporary ID until server assigns one
          userId: userData.id,
          placeId,
          rating,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    updateUser({
      ratings: updatedRatings,
    });
  };

  return { updateRating };
}
