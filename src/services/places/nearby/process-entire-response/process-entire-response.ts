import type {
  FilterReasons,
  GooglePlacesResponse,
  SimplifiedMapPlace,
} from '@/types/local-places-types';
import { processIndividualPlace } from '../process-individual-result/process-individual-result';

type Props = {
  googleData: GooglePlacesResponse;
  textQuery: string;
};

export function processGoogleResponse({
  googleData,
  textQuery,
}: Props): SimplifiedMapPlace[] {
  const keywords = textQuery
    .split('|')
    .map((k: string) => k.trim().toLowerCase());

  // Keep track of filtering stats
  const filterReasons: FilterReasons = {
    noKeywordMatch: 0,
    noEmoji: 0,
    defaultedToPlace: 0,
    mappedToMainCategory: 0,
  };

  // Process each place
  const results = googleData.places.map((place) =>
    processIndividualPlace({
      place,
      keywords,
      filterReasons,
    })
  );

  console.log('[API] Filter reasons:', filterReasons);

  return results;
}
