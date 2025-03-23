import { useQuery } from '@tanstack/react-query';
import type { User } from '@clerk/nextjs/server';

interface PaginatedUsersResponse {
  users: User[];
  totalCount: number;
  limit: number;
  offset: number;
}

interface UsePaginatedClerkUsersParams {
  limit?: number;
  offset?: number;
}

async function fetchClerkUsers({
  limit = 10,
  offset = 0,
}: UsePaginatedClerkUsersParams = {}): Promise<PaginatedUsersResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`/api/admin/clerk-users?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Clerk users');
  }
  return response.json();
}

export function useClerkUsers(options: UsePaginatedClerkUsersParams = {}) {
  return useQuery({
    queryKey: ['clerk-users', options.limit, options.offset],
    queryFn: () => fetchClerkUsers(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
