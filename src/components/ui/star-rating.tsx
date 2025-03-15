interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
  color?: string;
  roundToHalf?: boolean;
}

/**
 * StarRating component displays stars based on a rating value
 * @param rating - The rating value (e.g., 4 for 4 stars, 3.5 for 3.5 stars)
 * @param maxRating - The maximum possible rating (default: 5)
 * @param className - Additional CSS classes for styling
 * @param size - Size of the stars (sm, md, lg)
 * @param showEmpty - Whether to show empty stars (default: true)
 * @param color - Color of the filled stars (default: text-yellow-400)
 * @param roundToHalf - Whether to round the rating to the nearest half value (default: false)
 */
export function StarRating({
  rating,
  maxRating = 5,
  className = '',
  size = 'md',
  showEmpty = true,
  color = 'text-yellow-400',
  roundToHalf = false,
}: StarRatingProps) {
  // Round to nearest half if needed
  let displayRating = rating;
  if (roundToHalf) {
    // Round to nearest 0.5
    displayRating = Math.round(rating * 2) / 2;
  }

  // Ensure rating is within bounds
  const normalizedRating = Math.max(0, Math.min(displayRating, maxRating));

  // Determine size class
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFullStar = normalizedRating >= starValue;
        const isHalfStar = !isFullStar && normalizedRating >= starValue - 0.5;

        return (
          <div key={index} className='relative inline-block'>
            {/* Empty star (background) */}
            <span
              className={`${isFullStar ? color : 'text-gray-400'} ${sizeClass}`}
              aria-hidden='true'
            >
              {showEmpty || isFullStar || isHalfStar ? '☆' : ''}
            </span>

            {/* Full or half star (overlay) */}
            {(isFullStar || isHalfStar) && (
              <span
                className={`absolute top-0 left-0 overflow-hidden ${color} ${sizeClass}`}
                style={{
                  width: isFullStar ? '100%' : '50%',
                  whiteSpace: 'nowrap',
                }}
                aria-hidden='true'
              >
                ★
              </span>
            )}
          </div>
        );
      })}
      <span className='sr-only'>
        {roundToHalf ? displayRating : rating} out of {maxRating} stars
      </span>
    </div>
  );
}
