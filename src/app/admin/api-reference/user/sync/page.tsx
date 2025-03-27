'use client';

import { ArrowLeftRight, Database, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UserSyncPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold'>User Sync</h1>
        <p className='text-muted-foreground'>
          This endpoint is used when a user logs in on the mobile app to ensure
          data consistency between the mobile app and the database.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          The sync process is automatic and happens in the background when a
          user logs in through the mobile app. No manual intervention is
          required.
        </AlertDescription>
      </Alert>

      <div className='grid gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Smartphone className='h-5 w-5' />
              Mobile App Data
            </CardTitle>
            <CardDescription>
              Local data stored on the mobile device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2 text-sm'>
              <li>• Offline favorites</li>
              <li>• Local ratings</li>
              <li>• Cached preferences</li>
            </ul>
          </CardContent>
        </Card>

        <Card className='flex items-center justify-center p-6'>
          <div className='text-center space-y-4'>
            <ArrowLeftRight className='h-8 w-8 mx-auto text-muted-foreground' />
            <div className='text-sm text-muted-foreground'>
              Bidirectional Sync
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Database className='h-5 w-5' />
              Database Records
            </CardTitle>
            <CardDescription>Server-side stored data</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2 text-sm'>
              <li>• User preferences</li>
              <li>• Saved favorites</li>
              <li>• Location ratings</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Sync Process</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Mobile → Database</CardTitle>
              <CardDescription>
                Data sent from mobile app to server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-2 text-sm'>
                <li>1. New favorites added while offline</li>
                <li>2. Ratings created without internet connection</li>
                <li>3. Updated user preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database → Mobile</CardTitle>
              <CardDescription>
                Data sent from server to mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-2 text-sm'>
                <li>1. Previously saved favorites</li>
                <li>2. Historical ratings</li>
                <li>3. Latest user settings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
