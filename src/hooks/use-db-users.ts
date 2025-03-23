import { useQuery } from '@tanstack/react-query';
import type {
  UserWithCounts,
  PaginatedUserResponse,
} from '@/app/api/admin/db-users/route';

// Define our User interface with string dates instead of Date objects
export interface User {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  favoritesCount: number;
  ratingsCount: number;
}

// Define the paginated response type for the frontend
export interface PaginatedUsersResponse {
  users: User[];
  totalCount: number;
  limit: number;
  offset: number;
}

// Interface for pagination parameters
export interface UsePaginatedDbUsersParams {
  limit?: number;
  offset?: number;
}

// Transform Prisma User with counts (from API) to our User (with string dates)
function transformUser(user: UserWithCounts): User {
  return {
    ...user,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : String(user.createdAt),
    updatedAt:
      user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : String(user.updatedAt),
    favoritesCount: user.favoritesCount,
    ratingsCount: user.ratingsCount,
  };
}

async function fetchUsers({
  limit = 10,
  offset = 0,
}: UsePaginatedDbUsersParams = {}): Promise<PaginatedUsersResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`/api/admin/db-users?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const data = (await response.json()) as PaginatedUserResponse;

  // Transform each user in the response to our User type
  return {
    users: data.users.map(transformUser),
    totalCount: data.totalCount,
    limit: data.limit,
    offset: data.offset,
  };
}

export function useDbUsers(options: UsePaginatedDbUsersParams = {}) {
  return useQuery({
    queryKey: ['db-users', options.limit, options.offset],
    queryFn: () => fetchUsers(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
