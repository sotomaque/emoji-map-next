import type { Place, Rating } from '@prisma/client';

export type RatingWithPlace = Rating & {
  place: Pick<Place, 'name' | 'description'>;
};

export type RatingResponse = {
  ratings: RatingWithPlace[];
  totalCount: number;
  limit: number;
  offset: number;
};
