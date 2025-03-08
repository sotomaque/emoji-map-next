'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { env } from '@/src/env';
import EmojiMarker from './EmojiMarker';

// Define the center type
interface LatLngLiteral {
  lat: number;
  lng: number;
}

// Define the map options
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  panControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Define the marker type
interface MarkerData {
  id: string;
  position: LatLngLiteral;
  emoji: string;
  title: string;
  category?: string;
  priceLevel?: number;
  openNow?: boolean;
  rating?: number;
}

interface GoogleMapComponentProps {
  markers?: MarkerData[];
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (marker: MarkerData) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds | null) => void;
  onCenterChanged?: (center: LatLngLiteral) => void;
  onZoomChanged?: (zoom: number) => void;
  initialCenter?: LatLngLiteral;
  initialZoom?: number;
}

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const defaultZoom = 12;

export default function GoogleMapComponent({
  markers = [],
  onMapClick,
  onMarkerClick,
  onBoundsChanged,
  onCenterChanged,
  onZoomChanged,
  initialCenter = defaultCenter,
  initialZoom = defaultZoom,
}: GoogleMapComponentProps) {
  // Load the Google Maps JavaScript API
  const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Validate API key
  if (!apiKey) {
    console.error(
      'Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.'
    );
  } else if (apiKey.length < 20) {
    console.warn(
      'Google Maps API key seems too short. Please check your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.'
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  // State for the map
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [center, setCenter] = useState<LatLngLiteral>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);

  // Refs for the map
  const mapRef = useRef<google.maps.Map | null>(null);

  // Callback when the map is loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Callback when the map is unmounted
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (onMapClick && event.latLng) {
        onMapClick(event);
      }
      // Close info window when clicking on the map
      setSelectedMarker(null);
    },
    [onMapClick]
  );

  // Handle marker click
  const handleMarkerClick = useCallback(
    (marker: MarkerData) => {
      setSelectedMarker(marker);
      if (onMarkerClick) {
        onMarkerClick(marker);
      }
    },
    [onMarkerClick]
  );

  // Handle bounds changed
  const handleBoundsChanged = useCallback(() => {
    if (mapRef.current && onBoundsChanged) {
      // Only call onBoundsChanged when the map is idle to prevent too many updates
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        // Use requestAnimationFrame to throttle updates
        requestAnimationFrame(() => {
          onBoundsChanged(bounds);
        });
      }
    }
  }, [onBoundsChanged]);

  // Handle center changed
  const handleCenterChanged = useCallback(() => {
    if (mapRef.current && onCenterChanged) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        const centerObj = { lat: newCenter.lat(), lng: newCenter.lng() };
        // Only update local state if it's different from the current center
        // to prevent infinite loops
        if (
          Math.abs(centerObj.lat - center.lat) > 0.0001 ||
          Math.abs(centerObj.lng - center.lng) > 0.0001
        ) {
          // Use requestAnimationFrame to throttle updates
          requestAnimationFrame(() => {
            setCenter(centerObj);
            onCenterChanged(centerObj);
          });
        }
      }
    }
  }, [onCenterChanged, center]);

  // Handle zoom changed
  const handleZoomChanged = useCallback(() => {
    if (mapRef.current && onZoomChanged) {
      const newZoom = mapRef.current.getZoom();
      if (newZoom && newZoom !== zoom) {
        // Use requestAnimationFrame to throttle updates
        requestAnimationFrame(() => {
          setZoom(newZoom);
          onZoomChanged(newZoom);
        });
      }
    }
  }, [onZoomChanged, zoom]);

  // Helper function to render price level
  const renderPriceLevel = (priceLevel?: number) => {
    if (!priceLevel) return null;

    return (
      <div className='info-window-price'>
        {Array.from({ length: priceLevel }).map((_, i) => (
          <span key={i}>$</span>
        ))}
      </div>
    );
  };

  // Helper function to render rating
  const renderRating = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className='info-window-rating'>
        <span>{rating.toFixed(1)}</span>
        <span>★</span>
      </div>
    );
  };

  // Render loading state
  if (loadError) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900'>
        <div className='text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
          <p className='text-red-500 font-semibold'>
            Error loading Google Maps
          </p>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>
            {loadError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='text-6xl mb-4 animate-bounce'>🗺️</div>
          <h2 className='text-2xl font-semibold mb-2'>Loading Map...</h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Preparing your emoji map experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full w-full'>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        onBoundsChanged={handleBoundsChanged}
        onCenterChanged={handleCenterChanged}
        onZoomChanged={handleZoomChanged}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <EmojiMarker
            key={marker.id}
            position={marker.position}
            emoji={marker.emoji}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}

        {/* Render info window for selected marker */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className='info-window'>
              <h3 className='info-window-title'>{selectedMarker.title}</h3>

              <div className='info-window-category'>
                <span className='info-window-emoji'>
                  {selectedMarker.emoji}
                </span>
                <span>{selectedMarker.category || 'Place'}</span>
              </div>

              {renderRating(selectedMarker.rating)}
              {renderPriceLevel(selectedMarker.priceLevel)}

              {selectedMarker.openNow !== undefined &&
                (selectedMarker.openNow ? (
                  <div className='info-window-open'>Open now</div>
                ) : (
                  <div className='info-window-closed'>Closed</div>
                ))}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
