'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { User } from '@clerk/nextjs/server';

interface ClerkUserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClerkUserDetailsDialog({
  user,
  open,
  onOpenChange,
}: ClerkUserDetailsDialogProps) {
  if (!user) return null;

  // Format date for display
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper to render security status badge
  const SecurityBadge = ({ enabled }: { enabled: boolean }) => (
    <Badge
      variant={enabled ? 'default' : 'destructive'}
      className='font-medium'
    >
      {enabled ? 'Yes' : 'No'}
    </Badge>
  );

  // Helper to render admin status badge
  const AdminStatusBadge = ({ user }: { user: User }) => (
    <Badge
      variant={user.publicMetadata.admin === true ? 'default' : 'secondary'}
      className='font-medium'
    >
      {user.publicMetadata.admin === true ? 'Admin' : 'User'}
    </Badge>
  );

  // Helper to render account status badge
  const AccountStatusBadge = ({ user }: { user: User }) => {
    if (user.banned) {
      return <Badge variant='destructive'>Banned</Badge>;
    }
    if (user.locked) {
      return <Badge variant='secondary'>Locked</Badge>;
    }
    return <Badge variant='default'>Active</Badge>;
  };

  // Helper to render organization creation badge
  const OrgCreationBadge = ({ user }: { user: User }) => {
    if (!user.createOrganizationEnabled) {
      return <Badge variant='destructive'>Disabled</Badge>;
    }
    if (user.createOrganizationsLimit) {
      return (
        <Badge variant='secondary'>
          Limited ({user.createOrganizationsLimit})
        </Badge>
      );
    }
    return <Badge variant='default'>Unlimited</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Details for{' '}
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.emailAddresses[0]?.emailAddress}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='details' className='w-full'>
          <TabsList>
            <TabsTrigger value='details'>Details</TabsTrigger>
            <TabsTrigger value='metadata'>Metadata</TabsTrigger>
            <TabsTrigger value='security'>Security</TabsTrigger>
          </TabsList>

          <TabsContent value='details' className='space-y-6'>
            <div className='grid grid-cols-2 gap-4 py-4'>
              <div className='col-span-2'>
                <h3 className='font-medium text-sm mb-2'>User ID</h3>
                <div className='flex items-center gap-2'>
                  <code className='rounded bg-muted px-3 py-2 font-mono text-sm'>
                    {user.id}
                  </code>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => {
                      navigator.clipboard.writeText(user.id);
                      toast.success('User ID copied to clipboard');
                    }}
                  >
                    <Copy className='h-4 w-4' />
                    <span className='sr-only'>Copy user ID</span>
                  </Button>
                </div>
              </div>
              <div>
                <h3 className='font-medium text-sm'>Email</h3>
                <p className='text-sm'>
                  {user.emailAddresses[0]?.emailAddress || '-'}
                </p>
              </div>
              <div>
                <h3 className='font-medium text-sm'>Username</h3>
                <p className='text-sm'>{user.username || '-'}</p>
              </div>
              <div>
                <h3 className='font-medium text-sm'>First Name</h3>
                <p className='text-sm'>{user.firstName || '-'}</p>
              </div>
              <div>
                <h3 className='font-medium text-sm'>Last Name</h3>
                <p className='text-sm'>{user.lastName || '-'}</p>
              </div>
              <div>
                <h3 className='font-medium text-sm'>Created</h3>
                <p className='text-sm'>{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <h3 className='font-medium text-sm'>Updated</h3>
                <p className='text-sm'>{formatDate(user.updatedAt)}</p>
              </div>
              <div>
                <h3 className='font-medium text-sm'>Last Sign In</h3>
                <p className='text-sm'>{formatDate(user.lastSignInAt || 0)}</p>
              </div>
              <div>
                <h3 className='font-medium text-sm'>Last Active</h3>
                <p className='text-sm'>{formatDate(user.lastActiveAt || 0)}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='metadata' className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-medium text-sm mb-2'>Public Metadata</h3>
                <pre className='text-sm bg-muted p-4 rounded-md overflow-auto'>
                  {JSON.stringify(user.publicMetadata, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>Private Metadata</h3>
                <pre className='text-sm bg-muted p-4 rounded-md overflow-auto'>
                  {JSON.stringify(user.privateMetadata, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>Unsafe Metadata</h3>
                <pre className='text-sm bg-muted p-4 rounded-md overflow-auto'>
                  {JSON.stringify(user.unsafeMetadata, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='security' className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='font-medium text-sm mb-2'>Admin Status</h3>
                <AdminStatusBadge user={user} />
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>Account Status</h3>
                <AccountStatusBadge user={user} />
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>Password Enabled</h3>
                <SecurityBadge enabled={user.passwordEnabled} />
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>2FA Enabled</h3>
                <SecurityBadge enabled={user.twoFactorEnabled} />
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>TOTP Enabled</h3>
                <SecurityBadge enabled={user.totpEnabled} />
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>
                  Backup Codes Enabled
                </h3>
                <SecurityBadge enabled={user.backupCodeEnabled} />
              </div>
              <div>
                <h3 className='font-medium text-sm mb-2'>
                  Create Organizations
                </h3>
                <OrgCreationBadge user={user} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
