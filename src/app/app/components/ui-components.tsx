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
  const isPostRequest = url.startsWith('POST ');

  const copyToClipboard = () => {
    // Check if this is a POST request with a body
    if (isPostRequest) {
      // Extract the endpoint and body from the display string
      const [requestLine, ...bodyLines] = url.split('\n');
      const endpoint = requestLine.replace('POST ', '').trim();
      const bodyJson = bodyLines.join('\n').replace('Body: ', '');

      // Create a proper cURL command for a POST request with JSON body
      const curlCommand = `curl -X POST "${endpoint}" -H "Content-Type: application/json" -d '${bodyJson}'`;

      navigator.clipboard
        .writeText(curlCommand)
        .then(() => {
          toast.success('cURL command copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy cURL command: ', err);
          toast.error('Failed to copy cURL command');
        });
    } else {
      // Handle GET requests (original behavior)
      navigator.clipboard
        .writeText(`curl ${url}`)
        .then(() => {
          toast.success('cURL command copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy cURL command: ', err);
          toast.error('Failed to copy cURL command');
        });
    }
  };

  return (
    <div className='mt-4 mb-2'>
      <div className='flex justify-between items-center mb-1'>
        <h3 className='text-sm font-mono text-cyan-400'>Request URL:</h3>
        <button
          onClick={copyToClipboard}
          className='text-xs text-cyan-500 hover:text-cyan-400 transition-colors'
          title='Copy as cURL command'
        >
          Copy as cURL
        </button>
      </div>
      <pre className='bg-gray-900 p-2 rounded text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap'>
        {url}
      </pre>
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
