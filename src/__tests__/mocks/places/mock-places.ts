import type { GooglePlace } from '@/types/google-places';
import type { Place } from '@/types/places';

// Our Type
export const MOCK_PLACES: Place[] = [
  {
    id: '1',
    location: { latitude: 40.7128, longitude: -74.006 },
    emoji: '🍕',
  },
  {
    id: '2',
    location: { latitude: 40.7129, longitude: -74.0061 },
    emoji: '☕',
  },
];

// Google Places Type
export const MOCK_GOOGLE_PLACES: GooglePlace[] = [
  {
    id: '1',
    name: 'Test Pizza Place',
    formattedAddress: '123 Test St, Test City, TS 12345',
    location: {
      latitude: 32.8662,
      longitude: -117.2268,
    },
    types: ['restaurant', 'food', 'burger'],
  },
  {
    id: '2',
    name: 'Test Bakery',
    formattedAddress: '456 Test St, Test City, TS 12345',
    location: {
      latitude: 32.8662,
      longitude: -117.2268,
    },
    types: ['restaurant', 'food', 'burger'],
  },
];
