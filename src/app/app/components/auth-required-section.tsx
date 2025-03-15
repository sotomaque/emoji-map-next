import { SignInButton } from '@clerk/nextjs';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthRequiredSection() {
  return (
    <div className='flex-grow flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-zinc-900 border border-cyan-700 rounded-lg shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-cyan-600 to-purple-600 p-4'>
          <div className='flex items-center justify-center'>
            <LockKeyhole className='h-8 w-8 text-white mr-2' />
            <h2 className='text-xl font-bold text-white'>
              Admin Authentication Required
            </h2>
          </div>
        </div>
        <div className='p-6 text-center'>
          <p className='mb-6 text-cyan-300'>
            You need to sign in and have the correct permissions to access this
            section of the application.
          </p>
          <SignInButton mode='modal'>
            <Button className='bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-[0_0_10px_rgba(6,182,212,0.3)]'>
              Sign In to Continue
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
