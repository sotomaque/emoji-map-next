import type { NavItem } from '@/types/nav-items';
import { FEATURE_FLAGS } from '@/constants/feature-flags';
import { useGateValue } from '@statsig/react-bindings';

/**
 * Hook to filter navigation items based on feature flags and hidden status
 * @returns Utility functions to filter nav items
 */
export function useNavItems() {
  // Get the value for the ENABLE_APP feature flag
  const isAppEnabled = useGateValue(FEATURE_FLAGS.ENABLE_APP);
  
  /**
   * Determines if a navigation item should be shown based on its feature flag and hidden status
   * @param navItem The navigation item to check
   * @returns True if the item should be shown, false otherwise
   */
  const shouldShowNavItem = (navItem: NavItem): boolean => {
    // Don't show hidden items
    if (navItem.hidden) return false;
    
    // Check feature flag if present
    if (navItem.featureFlag) {
      // Check which feature flag is being used
      switch (navItem.featureFlag) {
        case 'ENABLE_APP':
          return isAppEnabled;
        // Add cases for other feature flags as needed
        default:
          return false; // If we don't recognize the flag, hide the item
      }
    }
    
    // No feature flag or hidden flag, show the item
    return true;
  };

  /**
   * Filters an array of navigation items based on their feature flags and hidden status
   * @param items Array of navigation items to filter
   * @returns Filtered array of navigation items
   */
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter(shouldShowNavItem)
      .map(item => {
        if (item.children && item.children.length > 0) {
          // Filter children recursively
          const filteredChildren = item.children.filter(shouldShowNavItem);
          return { ...item, children: filteredChildren };
        }
        return item;
      });
  };

  return {
    shouldShowNavItem,
    filterNavItems
  };
} 