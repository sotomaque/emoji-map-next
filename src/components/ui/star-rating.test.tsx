import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StarRating } from './star-rating';

describe('StarRating', () => {
  it('renders the correct number of full stars', () => {
    render(<StarRating rating={3} />);

    // Check for screen reader text
    expect(screen.getByText('3 out of 5 stars')).toBeInTheDocument();

    // We should have 5 stars total (3 filled, 2 empty)
    const stars = document.querySelectorAll('.relative.inline-block');
    expect(stars.length).toBe(5);

    // Check for 3 filled stars
    const filledStars = document.querySelectorAll('.absolute.top-0.left-0');
    expect(filledStars.length).toBe(3);

    // Check that the first 3 are full width (100%)
    for (let i = 0; i < 3; i++) {
      expect(filledStars[i]).toHaveStyle('width: 100%');
    }
  });

  it('renders half stars correctly', () => {
    render(<StarRating rating={3.5} />);

    // Check for screen reader text
    expect(screen.getByText('3.5 out of 5 stars')).toBeInTheDocument();

    // We should have 5 stars total
    const stars = document.querySelectorAll('.relative.inline-block');
    expect(stars.length).toBe(5);

    // Check for 4 stars with overlay (3 full, 1 half)
    const overlayStars = document.querySelectorAll('.absolute.top-0.left-0');
    expect(overlayStars.length).toBe(4);

    // Check that the first 3 are full width (100%)
    for (let i = 0; i < 3; i++) {
      expect(overlayStars[i]).toHaveStyle('width: 100%');
    }

    // Check that the 4th is half width (50%)
    expect(overlayStars[3]).toHaveStyle('width: 50%');
  });

  it('respects the maxRating prop', () => {
    render(<StarRating rating={3} maxRating={10} />);

    // We should have 10 stars total
    const stars = document.querySelectorAll('.relative.inline-block');
    expect(stars.length).toBe(10);

    // Check for 3 filled stars
    const filledStars = document.querySelectorAll('.absolute.top-0.left-0');
    expect(filledStars.length).toBe(3);
  });

  it('handles ratings greater than maxRating', () => {
    render(<StarRating rating={7} maxRating={5} />);

    // We should have 5 stars total, all filled
    const stars = document.querySelectorAll('.relative.inline-block');
    expect(stars.length).toBe(5);

    const filledStars = document.querySelectorAll('.absolute.top-0.left-0');
    expect(filledStars.length).toBe(5);

    // All should be full width
    for (let i = 0; i < 5; i++) {
      expect(filledStars[i]).toHaveStyle('width: 100%');
    }
  });

  it('applies custom color class', () => {
    render(<StarRating rating={3} color='text-red-500' />);

    const filledStars = document.querySelectorAll('.absolute.top-0.left-0');
    for (let i = 0; i < 3; i++) {
      expect(filledStars[i]).toHaveClass('text-red-500');
    }
  });

  it('applies custom size class', () => {
    render(<StarRating rating={3} size='lg' />);

    const stars = document.querySelectorAll('.text-lg');
    expect(stars.length).toBeGreaterThan(0);
  });

  describe('roundToHalf functionality', () => {
    it('rounds 3.2 down to 3', () => {
      render(<StarRating rating={3.2} roundToHalf={true} />);

      // Check for screen reader text
      expect(screen.getByText('3 out of 5 stars')).toBeInTheDocument();

      // Check for 3 filled stars
      const filledStars = document.querySelectorAll('.absolute.top-0.left-0');
      expect(filledStars.length).toBe(3);

      // All should be full width
      for (let i = 0; i < 3; i++) {
        expect(filledStars[i]).toHaveStyle('width: 100%');
      }
    });

    it('rounds 3.3 up to 3.5', () => {
      render(<StarRating rating={3.3} roundToHalf={true} />);

      // Check for screen reader text
      expect(screen.getByText('3.5 out of 5 stars')).toBeInTheDocument();

      // Check for 4 stars with overlay (3 full, 1 half)
      const overlayStars = document.querySelectorAll('.absolute.top-0.left-0');
      expect(overlayStars.length).toBe(4);

      // Check that the first 3 are full width (100%)
      for (let i = 0; i < 3; i++) {
        expect(overlayStars[i]).toHaveStyle('width: 100%');
      }

      // Check that the 4th is half width (50%)
      expect(overlayStars[3]).toHaveStyle('width: 50%');
    });

    it('rounds 3.7 down to 3.5', () => {
      render(<StarRating rating={3.7} roundToHalf={true} />);

      // Check for screen reader text
      expect(screen.getByText('3.5 out of 5 stars')).toBeInTheDocument();

      // Check for 4 stars with overlay (3 full, 1 half)
      const overlayStars = document.querySelectorAll('.absolute.top-0.left-0');
      expect(overlayStars.length).toBe(4);

      // Check that the 4th is half width (50%)
      expect(overlayStars[3]).toHaveStyle('width: 50%');
    });

    it('rounds 3.8 up to 4', () => {
      render(<StarRating rating={3.8} roundToHalf={true} />);

      // Check for screen reader text
      expect(screen.getByText('4 out of 5 stars')).toBeInTheDocument();

      // Check for 4 filled stars
      const filledStars = document.querySelectorAll('.absolute.top-0.left-0');
      expect(filledStars.length).toBe(4);

      // All should be full width
      for (let i = 0; i < 4; i++) {
        expect(filledStars[i]).toHaveStyle('width: 100%');
      }
    });
  });
});
