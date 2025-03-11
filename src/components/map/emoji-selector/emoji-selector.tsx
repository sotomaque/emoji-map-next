'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './emoji-selector.css';
import { CATEGORY_MAP } from '@/constants/category-map';
import { useFiltersStore } from '@/store/useFiltersStore';

// Transform the CATEGORY_MAP to an array for rendering
const categories = Object.entries(CATEGORY_MAP).map(([key, category]) => ({
  key: Number(key),
  emoji: category.emoji,
  name: category.name,
}));

interface EmojiSelectorProps {
  onShuffleClick: () => void;
  isLoading?: boolean;
}

export default function EmojiSelector({
  onShuffleClick,
  isLoading = false,
}: EmojiSelectorProps) {
  // Get state and actions from Zustand store
  const {
    selectedCategoryKeys,
    showFavoritesOnly,
    isAllCategoriesMode,
    setSelectedCategoryKeys,
    toggleCategoryKey,
    setShowFavoritesOnly,
  } = useFiltersStore();

  // Local state for UI
  const [isShuffleActive, setIsShuffleActive] = useState(false);

  // Ref for the scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle category toggle
  const handleCategoryToggle = (categoryKey: number) => {
    if (isLoading) return;

    console.log('[EmojiSelector] toggleCategory called with key:', categoryKey);
    console.log('[EmojiSelector] Current state:', {
      selectedCategoryKeys,
      isAllCategoriesMode,
    });

    if (isAllCategoriesMode) {
      // If "All" is currently selected and we're selecting a specific category
      console.log(
        '[EmojiSelector] Switching from All mode to single category key:',
        categoryKey
      );
      setSelectedCategoryKeys([categoryKey]);
      console.log('[EmojiSelector] After setSelectedCategoryKeys:', [
        categoryKey,
      ]);
    } else {
      // Use the store's toggle function
      console.log(
        '[EmojiSelector] Using store toggle function for key:',
        categoryKey
      );
      toggleCategoryKey(categoryKey);

      // Log the action
      if (selectedCategoryKeys.includes(categoryKey)) {
        console.log('[EmojiSelector] Removed category key:', categoryKey);
      } else {
        console.log('[EmojiSelector] Added category key:', categoryKey);
      }
    }
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    if (isLoading) return;

    console.log('[EmojiSelector] toggleAllCategories called');
    console.log('[EmojiSelector] Current state:', {
      selectedCategoryKeys,
      isAllCategoriesMode,
    });

    // If "All" is not already selected, switch to "All" mode
    if (!isAllCategoriesMode) {
      console.log('[EmojiSelector] Switching to All mode');
      setSelectedCategoryKeys([]);
      console.log('[EmojiSelector] After setSelectedCategoryKeys:', []);
    }
  };

  // Handle shuffle button click
  const handleShuffleClick = () => {
    if (isLoading) return;

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

    // Toggle favorites in the store
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  // Scroll to the appropriate element when categories change
  const scrollToSelectedCategory = useCallback(() => {
    if (scrollContainerRef.current) {
      if (isAllCategoriesMode) {
        // Scroll to the "All" button
        const allButton =
          scrollContainerRef.current.querySelector('.all-button');
        if (allButton) {
          allButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      } else if (selectedCategoryKeys.length > 0) {
        // Scroll to the first selected category
        const firstSelectedCategory = selectedCategoryKeys[0];
        const categoryElement = scrollContainerRef.current.querySelector(
          `[data-category="${firstSelectedCategory}"]`
        );
        if (categoryElement) {
          categoryElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      }
    }
  }, [isAllCategoriesMode, selectedCategoryKeys]);

  // Call scrollToSelectedCategory when categories change
  useEffect(() => {
    scrollToSelectedCategory();
  }, [scrollToSelectedCategory]);

  return (
    <div className='flex items-center justify-center space-x-1 sm:space-x-2 px-2 py-1 sm:py-2'>
      {/* Favorites Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        animate={{ scale: showFavoritesOnly ? 1.1 : 1 }}
        onClick={handleFavoritesToggle}
        disabled={isLoading}
        className={`flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full shadow-md ${
          showFavoritesOnly
            ? 'bg-yellow-400 text-yellow-900'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        aria-label='Toggle favorites'
      >
        <span className='text-lg sm:text-xl'>⭐</span>
      </motion.button>

      {/* Emoji Categories Scroll Container */}
      <div
        className='flex items-center bg-white dark:bg-gray-800 rounded-full shadow-md overflow-x-auto scrollbar-hide 
          w-1/3 md:w-1/2 lg:w-full
          max-w-[calc(100%-72px)] sm:max-w-[calc(100%-96px)]'
        ref={scrollContainerRef}
      >
        <div className='flex items-center space-x-1 px-2 py-1'>
          {/* All Categories Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            animate={{ scale: isAllCategoriesMode ? 1.1 : 1 }}
            onClick={toggleAllCategories}
            disabled={isLoading}
            className={`all-button flex items-center justify-center min-w-[36px] sm:min-w-[44px] h-8 sm:h-11 rounded-full ${
              isAllCategoriesMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            data-category='all'
            aria-label='All categories'
          >
            <span className='text-xs sm:text-sm font-medium px-2 sm:px-3'>
              All
            </span>
          </motion.button>

          {/* Individual Category Buttons */}
          <AnimatePresence>
            {categories.map((category) => {
              const isSelected =
                !isAllCategoriesMode &&
                selectedCategoryKeys.includes(category.key);

              return (
                <motion.button
                  key={category.key}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  animate={{ scale: isSelected ? 1.1 : 1 }}
                  onClick={() => handleCategoryToggle(category.key)}
                  disabled={isLoading}
                  className={`flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  data-category={category.key}
                  aria-label={`${category.name} category`}
                >
                  <span className='text-base sm:text-xl'>{category.emoji}</span>
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
          rotate: isShuffleActive ? 180 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        onClick={handleShuffleClick}
        disabled={isLoading}
        className={`flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
          isLoading
            ? 'opacity-70 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label='Shuffle'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          className='sm:w-5 sm:h-5'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M16 3h5v5'></path>
          <path d='M4 20L21 3'></path>
          <path d='M21 16v5h-5'></path>
          <path d='M15 15l6 6'></path>
          <path d='M4 4l5 5'></path>
        </svg>
      </motion.button>
    </div>
  );
}
