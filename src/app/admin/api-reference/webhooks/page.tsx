'use client';

import { AlertCircle, UserPlus, UserCog, UserX, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function WebhooksPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold'>Webhooks</h1>
        <p className='text-muted-foreground'>
          This endpoint receives and processes webhook events from Clerk for user management synchronization.
        </p>
      </div>

      <Alert>
        <div className='flex items-center gap-2'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' />
          <AlertDescription className='mt-0'>
            Webhooks are authenticated using Svix signatures. Each request must include valid svix-id, svix-timestamp, and svix-signature headers.
          </AlertDescription>
        </div>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Details</CardTitle>
          <CardDescription>Technical specifications for the webhook endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className='font-medium'>URL</TableCell>
                <TableCell>/api/webhooks</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-medium'>Method</TableCell>
                <TableCell>POST</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-medium'>Authentication</TableCell>
                <TableCell>Svix Webhook Signatures</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-medium'>Content-Type</TableCell>
                <TableCell>application/json</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className='grid gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserPlus className='h-5 w-5' />
              user.created
            </CardTitle>
            <CardDescription>New user registration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Badge>Event Type: user.created</Badge>
              <ul className='space-y-2 text-sm'>
                <li>• Creates new user record</li>
                <li>• Stores primary email</li>
                <li>• Saves profile information</li>
                <li>• Records creation timestamp</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserCog className='h-5 w-5' />
              user.updated
            </CardTitle>
            <CardDescription>User profile changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Badge>Event Type: user.updated</Badge>
              <ul className='space-y-2 text-sm'>
                <li>• Updates existing record</li>
                <li>• Handles email changes</li>
                <li>• Updates profile data</li>
                <li>• Creates user if not found</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserX className='h-5 w-5' />
              user.deleted
            </CardTitle>
            <CardDescription>Account deletion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Badge>Event Type: user.deleted</Badge>
              <ul className='space-y-2 text-sm'>
                <li>• Removes user record</li>
                <li>• Cascades deletions</li>
                <li>• Cleans up user data</li>
                <li>• Verifies user exists</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Security Considerations
          </CardTitle>
          <CardDescription>Important security measures for webhook handling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h3 className='font-medium mb-2'>Required Headers</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Header</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className='font-mono'>svix-id</TableCell>
                    <TableCell>Unique identifier for the webhook request</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className='font-mono'>svix-timestamp</TableCell>
                    <TableCell>When the webhook was sent</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className='font-mono'>svix-signature</TableCell>
                    <TableCell>Cryptographic signature to verify authenticity</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className='font-medium mb-2'>Verification Process</h3>
              <ul className='space-y-2 text-sm'>
                <li>1. Validates all required headers are present</li>
                <li>2. Verifies webhook signature using CLERK_SIGNING_SECRET</li>
                <li>3. Checks event type and payload structure</li>
                <li>4. Processes event only if verification succeeds</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
