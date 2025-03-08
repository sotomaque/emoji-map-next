'use client';

import React from 'react';
import { OverlayView } from '@react-google-maps/api';

interface EmojiMarkerProps {
  position: google.maps.LatLngLiteral;
  emoji: string;
  onClick: () => void;
}

export default function EmojiMarker({ position, emoji, onClick }: EmojiMarkerProps) {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -height,
      })}
    >
      <div
        className="emoji-marker"
        onClick={onClick}
        style={{
          cursor: 'pointer',
          fontSize: '30px',
          lineHeight: '1',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          transition: 'transform 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {emoji}
      </div>
    </OverlayView>
  );
} 