'use client';

import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

// Form schema for user update
const updateUserFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

export default function UserPage() {
  const { getToken } = useAuth();
  const apiBaseUrl = env.NEXT_PUBLIC_SITE_URL;
  const queryClient = useQueryClient();

  // Form for updating user
  const updateForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  // Query for fetching user data
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

  // Mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: async (values: UpdateUserFormValues) => {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/api/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      updateForm.reset();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update user'
      );
    },
  });

  // Handle form submission
  const onSubmit = (values: UpdateUserFormValues) => {
    updateUserMutation.mutate(values);
  };

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
            {error instanceof Error ? error.message : 'Failed to load user data'}
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
      <div className='grid gap-4 md:grid-cols-2'>
        {/* User Info Card */}
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

        {/* Update User Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Update User</CardTitle>
            <CardDescription>Update user information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...updateForm}>
              <form
                onSubmit={updateForm.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={updateForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter your email'
                          type='email'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter your first name'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-between pt-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => updateForm.reset()}
                  >
                    Reset
                  </Button>
                  <Button
                    type='submit'
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending
                      ? 'Updating...'
                      : 'Update User'}
                  </Button>
                </div>
              </form>
            </Form>
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
