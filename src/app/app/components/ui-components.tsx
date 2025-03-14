'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Loading spinner component
export const LoadingSpinner = () => (
  <div className='flex flex-col justify-center items-center py-8'>
    <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-4'></div>
    <div className='text-cyan-400 font-mono text-lg'>
      <span className='animate-pulse'>[</span>LOADING
      <span className='animate-pulse'>_]</span>
    </div>
  </div>
);

// JSON display component with client-side functionality
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const JsonDisplay = ({ data }: { data: any }) => {
  const copyToClipboard = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        toast.success('JSON copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy JSON: ', err);
        toast.error('Failed to copy JSON');
      });
  };

  return (
    <div className='relative'>
      <button
        onClick={copyToClipboard}
        className='absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 px-2 py-1 rounded-sm text-xs font-mono'
      >
        [COPY]
      </button>
      <pre className='bg-zinc-950 p-4 rounded-sm text-cyan-400 overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto'>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

// Request URL display component with client-side functionality
export const RequestUrlDisplay = ({ url }: { url: string }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`curl ${url}`)
      .then(() => {
        toast.success('cURL command copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy cURL command: ', err);
        toast.error('Failed to copy cURL command');
      });
  };

  return (
    <div className='flex-1 overflow-x-auto group relative'>
      <pre className='text-xs text-cyan-700 dark:text-cyan-700 font-mono'>
        $ curl {url}
      </pre>
      <button
        onClick={copyToClipboard}
        className='opacity-0 group-hover:opacity-100 absolute right-0 top-0 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 px-2 py-1 rounded-sm text-xs font-mono transition-opacity'
      >
        [COPY]
      </button>
    </div>
  );
};

// Components that can be server components (static UI with no client-side functionality)
export const HackerTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className='text-lg font-bold text-cyan-400 dark:text-cyan-400 font-mono'>
    {children}
  </h2>
);

export const HackerCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-zinc-900 dark:bg-zinc-900 border border-cyan-800 dark:border-cyan-800 rounded-md shadow-[0_0_15px_rgba(8,145,178,0.1)] ${className}`}
  >
    {children}
  </div>
);

export const HackerCardHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className='border-b border-cyan-800 dark:border-cyan-800 p-5'>
    {children}
  </div>
);

export const HackerCardContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-5 ${className}`}>{children}</div>;

export const HackerCardFooter = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className='border-t border-cyan-800 dark:border-cyan-800 p-5'>
    {children}
  </div>
);

// Client-only components that need interactivity
export const HackerInput = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    className='bg-zinc-950 dark:bg-zinc-950 border-cyan-800 dark:border-cyan-800 text-cyan-400 dark:text-cyan-400 font-mono focus:border-cyan-600 focus:ring-cyan-600'
    {...props}
  />
);

export const HackerButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => (
  <Button
    className={`bg-cyan-950 hover:bg-cyan-900 text-cyan-400 dark:text-cyan-400 font-mono border border-cyan-800 dark:border-cyan-800 ${className}`}
    {...props}
  >
    {children}
  </Button>
);

export const ResetButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className='text-xs text-cyan-700 hover:text-cyan-500 font-mono'
  >
    [RESET]
  </button>
);
