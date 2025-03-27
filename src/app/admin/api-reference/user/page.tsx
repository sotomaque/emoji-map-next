'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { env } from '@/env';
import type { User, Favorite, Rating } from '@prisma/client';

interface UserResponse {
  user: User & {
    favorites?: Favorite[];
    ratings?: Rating[];
  };
  status: number;
}

export default function UserPage() {
  const { getToken } = useAuth();
  const apiBaseUrl = env.NEXT_PUBLIC_SITE_URL;

  const { data, isLoading, isError, error } = useQuery<UserResponse>({
    queryKey: ['user'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className='flex flex-1 flex-col gap-4 p-4'>
        <h1 className='text-2xl font-bold'>User</h1>
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className='h-4 w-[200px]' />
              </CardTitle>
              <CardDescription>
                <Skeleton className='h-4 w-[150px]' />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className='h-20 w-full' />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className='h-4 w-[200px]' />
              </CardTitle>
              <CardDescription>
                <Skeleton className='h-4 w-[150px]' />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className='h-20 w-full' />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className='h-4 w-[200px]' />
              </CardTitle>
              <CardDescription>
                <Skeleton className='h-4 w-[150px]' />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className='h-20 w-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-1 flex-col gap-4 p-4'>
        <h1 className='text-2xl font-bold'>User</h1>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Failed to load user data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { user } = data;

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <h1 className='text-2xl font-bold'>User</h1>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
            <CardDescription>Basic user information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className='space-y-2'>
              <div>
                <dt className='font-medium'>ID</dt>
                <dd className='text-sm text-muted-foreground'>{user.id}</dd>
              </div>
              <div>
                <dt className='font-medium'>Created At</dt>
                <dd className='text-sm text-muted-foreground'>
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className='font-medium'>Updated At</dt>
                <dd className='text-sm text-muted-foreground'>
                  {new Date(user.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorites</CardTitle>
            <CardDescription>User&apos;s favorite locations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              {user.favorites?.length ?? 0} favorite locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratings</CardTitle>
            <CardDescription>User&apos;s location ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              {user.ratings?.length ?? 0} rated locations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
