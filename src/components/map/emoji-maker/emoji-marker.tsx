'use client';

import React, { memo, useEffect, useState, useRef } from 'react';
import { OverlayView } from '@react-google-maps/api';

/**
 * Props for the EmojiMarker component
 *
 * @interface EmojiMarkerProps
 * @property {google.maps.LatLngLiteral} position - The geographical position of the marker
 * @property {string} emoji - The emoji character to display as the marker
 * @property {Function} onClick - Callback function triggered when the marker is clicked
 * @property {boolean} [isNew=false] - Whether this is a newly added marker (affects animation)
 * @property {number} [animationDelay=0] - Delay in milliseconds before showing the marker (for staggered animations)
 * @property {boolean} [isTransitioning=false] - Whether the map is currently transitioning between viewports
 */
interface EmojiMarkerProps {
  position: google.maps.LatLngLiteral;
  emoji: string;
  onClick: () => void;
  isNew?: boolean;
  animationDelay?: number;
  isTransitioning?: boolean;
}

/**
 * EmojiMarker Component
 *
 * Renders an emoji as a marker on a Google Map with animation effects.
 * Uses React.memo for performance optimization to prevent unnecessary re-renders.
 *
 * Features:
 * - Fade-in animation for new markers
 * - Hover effects (scale up/down)
 * - Optimized rendering with custom equality check
 * - Development-only logging
 *
 * @param {EmojiMarkerProps} props - Component props
 * @returns {JSX.Element} The rendered emoji marker
 */
const EmojiMarker = memo(
  function EmojiMarker({
    position,
    emoji,
    onClick,
    isNew = false,
    animationDelay = 0,
    isTransitioning = false,
  }: EmojiMarkerProps) {
    // State to track if the marker is visible
    const [isVisible, setIsVisible] = useState(!isNew);

    // Ref to track if this is the first render
    const isFirstRender = useRef(true);

    // Ref to track the previous position
    const prevPositionRef = useRef(position);

    // Effect to handle delayed appearance for new markers
    useEffect(() => {
      if (isNew) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, animationDelay);

        return () => clearTimeout(timer);
      }
    }, [isNew, animationDelay]);

    // Effect to handle transitioning state
    useEffect(() => {
      if (isTransitioning) {
        // When transitioning, we can add special effects or behaviors
        console.log(`[EmojiMarker] Marker ${emoji} is in transition state`);
      }
    }, [isTransitioning, emoji]);

    // Log when marker renders
    useEffect(() => {
      // Skip logging in production
      if (process.env.NODE_ENV !== 'development') {
        return;
      }

      if (isFirstRender.current) {
        console.log(
          `[EmojiMarker] Initial render of ${emoji} marker, isNew: ${isNew}, animationDelay: ${animationDelay}ms`
        );
        isFirstRender.current = false;
        return;
      }

      // Check if position has changed significantly
      const positionChanged =
        Math.abs(prevPositionRef.current.lat - position.lat) > 0.0000001 ||
        Math.abs(prevPositionRef.current.lng - position.lng) > 0.0000001;

      if (positionChanged) {
        console.log(`[EmojiMarker] Position update for ${emoji} marker`);
        prevPositionRef.current = position;
        return;
      }

      console.log(
        `[EmojiMarker] Re-render of ${emoji} marker (no position change)`
      );
    }, [position, emoji, isNew, animationDelay]);

    return (
      <OverlayView
        position={position}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        getPixelPositionOffset={(width, height) => ({
          x: -(width / 2),
          y: -(height / 2),
        })}
      >
        <div
          className='emoji-marker'
          style={{
            fontSize: '2rem',
            cursor: 'pointer',
            userSelect: 'none',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden',
            // Only apply animation to new markers
            animation: isNew ? undefined : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={onClick}
        >
          {emoji}
        </div>
      </OverlayView>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the emoji changes or position changes significantly
    const positionChanged =
      Math.abs(prevProps.position.lat - nextProps.position.lat) > 0.0000001 ||
      Math.abs(prevProps.position.lng - nextProps.position.lng) > 0.0000001;

    // Always return true for the same emoji and position to prevent re-renders
    return prevProps.emoji === nextProps.emoji && !positionChanged;
  }
);

export default EmojiMarker;
