'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './EmojiSelector.css';
import { categories as categoriesData } from '@/src/services/places';
import { useFiltersStore } from '@/src/store/useFiltersStore';

// Transform the categories data to match the expected format
const categories = categoriesData.map(([emoji, name, type]) => ({
  emoji,
  name,
  type
}));

interface EmojiSelectorProps {
  onShuffleClick: () => void;
  isLoading?: boolean;
}

export default function EmojiSelector({
  onShuffleClick,
  isLoading = false
}: EmojiSelectorProps) {
  // Get state and actions from Zustand store
  const {
    selectedCategories,
    showFavoritesOnly,
    isAllCategoriesMode,
    setSelectedCategories,
    toggleCategory: storeToggleCategory,
    setShowFavoritesOnly
  } = useFiltersStore();

  // Local state for UI
  const [isShuffleActive, setIsShuffleActive] = useState(false);

  // Ref for the scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle category toggle
  const toggleCategory = (categoryName: string) => {
    if (isLoading) return;

    console.log('[EmojiSelector] toggleCategory called with:', categoryName);
    console.log('[EmojiSelector] Current state:', {
      selectedCategories,
      isAllCategoriesMode
    });

    // Play a click sound for feedback
    playClickSound();

    if (isAllCategoriesMode) {
      // If "All" is currently selected and we're selecting a specific category
      console.log('[EmojiSelector] Switching from All mode to single category:', categoryName);
      setSelectedCategories([categoryName]);
      console.log('[EmojiSelector] After setSelectedCategories:', [categoryName]);
    } else {
      // Use the store's toggle function
      console.log('[EmojiSelector] Using store toggle function for:', categoryName);
      storeToggleCategory(categoryName);

      // Log the action
      if (selectedCategories.includes(categoryName)) {
        console.log('[EmojiSelector] Removed category:', categoryName);
      } else {
        console.log('[EmojiSelector] Added category:', categoryName);
      }
    }
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    if (isLoading) return;

    console.log('[EmojiSelector] toggleAllCategories called');
    console.log('[EmojiSelector] Current state:', {
      selectedCategories,
      isAllCategoriesMode
    });

    // Play a click sound for feedback
    playClickSound();

    // If "All" is not already selected, switch to "All" mode
    if (!isAllCategoriesMode) {
      console.log('[EmojiSelector] Switching to All mode');
      setSelectedCategories([]);
      console.log('[EmojiSelector] After setSelectedCategories:', []);
    }
  };

  // Handle shuffle button click
  const handleShuffleClick = () => {
    if (isLoading) return;

    // Play a click sound for feedback
    playClickSound();

    // Activate shuffle animation briefly
    setIsShuffleActive(true);

    // Call the shuffle handler
    onShuffleClick();

    // Reset shuffle animation after a delay
    setTimeout(() => {
      setIsShuffleActive(false);
    }, 500);
  };

  // Toggle favorites
  const handleFavoritesToggle = () => {
    if (isLoading) return;

    // Play a click sound for feedback
    playClickSound();

    // Toggle favorites in the store
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  // Simple click sound for feedback
  const playClickSound = () => {
    // Check if the Web Audio API is supported
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioCtx = new window.AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
      } catch (error) {
        console.error('Error playing click sound:', error);
      }
    }
  };

  // Scroll to the first selected category or the "All" button
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (isAllCategoriesMode) {
        // Scroll to the "All" button
        const allButton = scrollContainerRef.current.querySelector('.all-button');
        if (allButton) {
          allButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      } else if (selectedCategories.length > 0) {
        // Scroll to the first selected category
        const firstSelectedCategory = selectedCategories[0];
        const categoryElement = scrollContainerRef.current.querySelector(`[data-category="${firstSelectedCategory}"]`);
        if (categoryElement) {
          categoryElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }
  }, [isAllCategoriesMode, selectedCategories]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center space-x-2 px-2 py-1">
        {/* Favorites Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          animate={{ scale: showFavoritesOnly ? 1.1 : 1 }}
          onClick={handleFavoritesToggle}
          disabled={isLoading}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md ${showFavoritesOnly
            ? 'bg-yellow-400 text-yellow-900'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          aria-label="Toggle favorites"
        >
          <span className="text-xl">⭐</span>
        </motion.button>

        {/* Emoji Categories Scroll Container */}
        <div
          className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-md overflow-x-auto scrollbar-hide max-w-[calc(100%-96px)]"
          style={{ scrollbarWidth: 'none' }}
          ref={scrollContainerRef}
        >
          <div className="flex items-center space-x-1 px-2 py-1">
            {/* All Categories Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              animate={{ scale: isAllCategoriesMode ? 1.1 : 1 }}
              onClick={toggleAllCategories}
              disabled={isLoading}
              className={`flex items-center justify-center min-w-[44px] h-11 rounded-full ${isAllCategoriesMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              data-category="all"
              aria-label="All categories"
            >
              <span className="text-sm font-medium px-3">All</span>
            </motion.button>

            {/* Individual Category Buttons */}
            <AnimatePresence>
              {categories.map((category) => {
                const isSelected = !isAllCategoriesMode && selectedCategories.includes(category.name);

                return (
                  <motion.button
                    key={category.name}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    animate={{ scale: isSelected ? 1.1 : 1 }}
                    onClick={() => toggleCategory(category.name)}
                    disabled={isLoading}
                    className={`flex items-center justify-center w-11 h-11 rounded-full ${isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    data-category={category.name}
                    aria-label={`${category.name} category`}
                  >
                    <span className="text-xl">{category.emoji}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Shuffle Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          animate={{
            scale: isShuffleActive ? 1.2 : 1,
            rotate: isShuffleActive ? 180 : 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          onClick={handleShuffleClick}
          disabled={isLoading}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          aria-label="Shuffle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5"></path>
            <path d="M4 20L21 3"></path>
            <path d="M21 16v5h-5"></path>
            <path d="M15 15l6 6"></path>
            <path d="M4 4l5 5"></path>
          </svg>
        </motion.button>
      </div>
    </div>
  );
} 