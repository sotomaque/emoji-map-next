import type { User } from '@prisma/client';

export interface UsePaginatedDbUsersParams {
  limit?: number;
  offset?: number;
}

export type UserWithCounts = User & {
  favoritesCount: number;
  ratingsCount: number;
};

export interface PaginatedDBUsersResponse {
  users: UserWithCounts[];
  totalCount: number;
  limit: number;
  offset: number;
}
