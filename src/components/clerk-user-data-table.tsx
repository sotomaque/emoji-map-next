'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '@clerk/nextjs/server';

interface ClerkUserDataTableProps {
  users: User[];
  totalCount: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  error: Error | null;
  onPaginationChange: (limit: number, offset: number) => void;
}

export function ClerkUserDataTable({
  users,
  totalCount,
  limit,
  offset,
  isLoading,
  error,
  onPaginationChange,
}: ClerkUserDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.emailAddresses.some((email) =>
            email.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (user.username &&
            user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.firstName &&
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.lastName &&
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  // Handle page change
  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    onPaginationChange(limit, newOffset);
  };

  // Handle limit change
  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    onPaginationChange(newLimit, 0); // Reset to first page when changing limit
  };

  // Generate page numbers for pagination
  const generatePaginationItems = () => {
    const items = [];

    // Always include first page
    items.push(
      <PaginationItem key='page-1'>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key='ellipsis-1'>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add page numbers around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key='ellipsis-2'>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always include last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clerk Users</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center p-8'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='bg-destructive/10 text-destructive p-4 rounded-md'>
            {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format date for display
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get primary email for a user
  const getPrimaryEmail = (user: User) => {
    if (user.emailAddresses.length === 0) return '-';
    return user.emailAddresses[0].emailAddress;
  };

  // Get initials for avatar fallback
  const getInitials = (user: User) => {
    let initials = '';
    if (user.firstName) initials += user.firstName[0].toUpperCase();
    if (user.lastName) initials += user.lastName[0].toUpperCase();
    if (!initials && user.username) initials = user.username[0].toUpperCase();
    if (!initials && user.emailAddresses.length > 0) {
      initials = user.emailAddresses[0].emailAddress[0].toUpperCase();
    }
    return initials || '?';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clerk Users</CardTitle>
        <CardDescription>A list of all users in Clerk</CardDescription>

        <div className='flex items-center gap-2 mt-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search users...'
              className='w-full pl-8'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant='outline' onClick={() => setSearchTerm('')}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableCaption>
              Showing {offset + 1}-{Math.min(offset + users.length, totalCount)}{' '}
              of {totalCount} users
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Last Sign In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-center py-8 text-muted-foreground'
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar>
                          <AvatarImage
                            src={user.imageUrl || undefined}
                            alt={`${user.firstName || ''} ${
                              user.lastName || ''
                            }`}
                          />
                          <AvatarFallback>{getInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName || user.lastName || '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPrimaryEmail(user)}</TableCell>
                    <TableCell>{user.username || '-'}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{formatDate(user.updatedAt)}</TableCell>
                    <TableCell>{formatDate(user.lastSignInAt || 0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center space-x-2'>
            <p className='text-sm text-muted-foreground'>Rows per page</p>
            <Select value={limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className='w-[70px]'>
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5</SelectItem>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='20'>20</SelectItem>
                <SelectItem value='50'>50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() =>
                  currentPage > 1 && handlePageChange(currentPage - 1)
                }
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />

              {generatePaginationItems()}

              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && handlePageChange(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
