import type { User } from '@clerk/nextjs/server';

export type AdminClerkUsersResponse = {
  users: User[];
  totalCount: number;
  limit: number;
  offset: number;
};
