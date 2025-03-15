// Static UI components that don't need client-side interactivity
export const HackerTitle = ({ children }: { children: React.ReactNode }) => (
  <div className='font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center space-x-2 text-lg mb-1'>
    <span className='text-cyan-400'>$</span>
    <span className='text-purple-500'>_</span>
    <span>{children}</span>
  </div>
);

export const HackerCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-zinc-900 dark:bg-zinc-900 border border-cyan-800 rounded-sm ${className} shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-sm`}
  >
    {children}
  </div>
);

export const HackerCardHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className='border-b border-cyan-800 p-5 bg-gradient-to-r from-zinc-950 to-zinc-900 dark:from-zinc-950 dark:to-zinc-900'>
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
  <div className='border-t border-cyan-800 p-5 bg-gradient-to-r from-zinc-950 to-zinc-900 dark:from-zinc-950 dark:to-zinc-900'>
    {children}
  </div>
);

// Static display components
export const StaticRequestUrlDisplay = ({ url }: { url: string }) => (
  <div className='flex-1 overflow-x-auto'>
    <pre className='text-xs text-cyan-700 dark:text-cyan-700 font-mono'>
      $ curl {url}
    </pre>
  </div>
);
