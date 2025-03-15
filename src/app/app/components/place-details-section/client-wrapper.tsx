'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { DetailResponse } from '@/types/details';
import PlaceDetailsSection from '../place-details-section/index';
import { DEFAULT_PLACE_ID } from '../types';

// This is a client wrapper component that manages state and passes it to the client component
const ClientWrapper: React.FC = () => {
  const queryClient = useQueryClient();
  const [placeId, setPlaceId] = useState(DEFAULT_PLACE_ID);
  const [bypassCache, setBypassCache] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // TanStack Query for place details
  const placeDetailsQuery = useQuery({
    queryKey: ['placeDetails', placeId, bypassCache],
    queryFn: async () => {
      if (!placeId) {
        toast.error('Place ID is required');
        throw new Error('ID is required');
      }

      const params = new URLSearchParams({
        id: placeId,
      });

      if (bypassCache) {
        params.append('bypassCache', 'true');
      }

      try {
        const response = await fetch(
          `/api/places/details?${params.toString()}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API returned ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        return response.json() as Promise<DetailResponse>;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Place details query failed: ${errorMessage}`);
        throw error;
      }
    },
    enabled: false, // Don't run automatically on mount or when placeId changes
    retry: 1,
  });

  // Function to clear place details query data
  const handleClearPlaceDetails = () => {
    queryClient.removeQueries({ queryKey: ['placeDetails'] });
    setPlaceId(DEFAULT_PLACE_ID);
    toast.success('Place details results cleared');
  };

  return (
    <PlaceDetailsSection
      placeId={placeId}
      setPlaceId={setPlaceId}
      placeDetailsQuery={placeDetailsQuery}
      bypassCache={bypassCache}
      setBypassCache={setBypassCache}
      showRawJson={showRawJson}
      setShowRawJson={setShowRawJson}
      handleClearPlaceDetails={handleClearPlaceDetails}
    />
  );
};

export default ClientWrapper;
