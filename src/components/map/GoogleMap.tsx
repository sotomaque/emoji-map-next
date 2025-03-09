'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { env } from '@/env';
import EmojiMarker from './EmojiMarker';
import { useTheme } from 'next-themes';

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
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const darkModeMapOptions = [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] },
{ elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
{ elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
{
  featureType: "administrative.locality",
  elementType: "labels.text.fill",
  stylers: [{ color: "#d59563" }],
},
{
  featureType: "poi",
  elementType: "labels.text.fill",
  stylers: [{ color: "#d59563" }],
},
{
  featureType: "poi.park",
  elementType: "geometry",
  stylers: [{ color: "#263c3f" }],
},
{
  featureType: "poi.park",
  elementType: "labels.text.fill",
  stylers: [{ color: "#6b9a76" }],
},
{
  featureType: "road",
  elementType: "geometry",
  stylers: [{ color: "#38414e" }],
},
{
  featureType: "road",
  elementType: "geometry.stroke",
  stylers: [{ color: "#212a37" }],
},
{
  featureType: "road",
  elementType: "labels.text.fill",
  stylers: [{ color: "#9ca5b3" }],
},
{
  featureType: "road.highway",
  elementType: "geometry",
  stylers: [{ color: "#746855" }],
},
{
  featureType: "road.highway",
  elementType: "geometry.stroke",
  stylers: [{ color: "#1f2835" }],
},
{
  featureType: "road.highway",
  elementType: "labels.text.fill",
  stylers: [{ color: "#f3d19c" }],
},
{
  featureType: "transit",
  elementType: "geometry",
  stylers: [{ color: "#2f3948" }],
},
{
  featureType: "transit.station",
  elementType: "labels.text.fill",
  stylers: [{ color: "#d59563" }],
},
{
  featureType: "water",
  elementType: "geometry",
  stylers: [{ color: "#17263c" }],
},
{
  featureType: "water",
  elementType: "labels.text.fill",
  stylers: [{ color: "#515c6d" }],
},
{
  featureType: "water",
  elementType: "labels.text.stroke",
  stylers: [{ color: "#17263c" }],
},]

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
  isTransitioning?: boolean;
  newMarkerIds?: Set<string>;
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
  isTransitioning = false,
  newMarkerIds = new Set<string>(),
}: GoogleMapComponentProps) {
  // Theme
  const { theme } = useTheme();

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
  const [center] = useState<LatLngLiteral>(initialCenter);
  const [zoom] = useState<number>(initialZoom);

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
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (onMapClick && event.latLng) {
      onMapClick(event);
    }
  }, [onMapClick]);

  // Handle bounds changed
  const handleBoundsChanged = useCallback(() => {
    if (mapRef.current && onBoundsChanged) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        onBoundsChanged(bounds);
      }
    }
  }, [onBoundsChanged]);

  // Handle center changed
  const handleCenterChanged = useCallback(() => {
    if (mapRef.current && onCenterChanged) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        const centerObj = { lat: newCenter.lat(), lng: newCenter.lng() };
        onCenterChanged(centerObj);
      }
    }
  }, [onCenterChanged]);

  // Handle zoom changed
  const handleZoomChanged = useCallback(() => {
    if (mapRef.current && onZoomChanged) {
      const newZoom = mapRef.current.getZoom();
      if (newZoom) {
        onZoomChanged(newZoom);
      }
    }
  }, [onZoomChanged]);

  const themedMapOptions = useMemo(() => {
    if (theme !== 'dark') {
      return mapOptions;
    }

    return {
      ...mapOptions,
      styles: [...mapOptions?.styles || [], ...darkModeMapOptions],
    }
  }, [theme]);

  // Memoize markers to prevent unnecessary re-renders
  const memoizedMarkers = useMemo(() => {
    console.log('[GoogleMap] Rendering markers:', markers.length);
    console.log('[GoogleMap] New markers count:', newMarkerIds.size);
    console.log('[GoogleMap] isTransitioning:', isTransitioning);

    if (!markers || markers.length === 0) {
      console.log('[GoogleMap] No markers to render');
      return [];
    }

    // Render all markers, with special handling for new ones
    return markers.map((marker) => {
      const isNewMarker = newMarkerIds.has(marker.id);
      const delay = isNewMarker ? Math.min(Array.from(newMarkerIds).indexOf(marker.id) * 20, 500) : 0;

      console.log(`[GoogleMap] Rendering marker ${marker.id} (${marker.emoji}), isNew: ${isNewMarker}, delay: ${delay}ms`);

      return (
        <EmojiMarker
          key={marker.id}
          position={marker.position}
          emoji={marker.emoji}
          onClick={() => onMarkerClick?.(marker)}
          isNew={isNewMarker}
          delay={delay}
        />
      );
    });
  }, [markers, onMarkerClick, newMarkerIds]);

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
        options={themedMapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        onBoundsChanged={handleBoundsChanged}
        onCenterChanged={handleCenterChanged}
        onZoomChanged={handleZoomChanged}
      >
        {/* Render memoized markers */}
        {memoizedMarkers}
      </GoogleMap>
    </div>
  );
}
