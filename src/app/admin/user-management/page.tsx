import Link from 'next/link';
import { Layers, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UserManagementPage() {
  return (
    <div className='container max-w-7xl py-10'>
      <h1 className='text-3xl font-bold mb-6'>User Management</h1>

      <div className='grid gap-6 sm:grid-cols-2'>
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-muted-foreground' />
              <CardTitle>Clerk Users</CardTitle>
            </div>
            <CardDescription>
              Users registered through Clerk authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              View all users registered with your Clerk authentication service.
              Includes profile information and authentication details.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href='/admin/user-management/clerk-users'>
                View Clerk Users
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Layers className='h-5 w-5 text-muted-foreground' />
              <CardTitle>Database Users</CardTitle>
            </div>
            <CardDescription>
              Users stored in your application database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              View all users stored in your application database. Includes user
              activity data such as favorites and ratings.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href='/admin/user-management/db-users'>
                View Database Users
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
