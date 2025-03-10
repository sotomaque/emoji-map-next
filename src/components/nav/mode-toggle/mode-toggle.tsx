'use client';

import * as React from 'react';
import {
  MoonIcon,
  SunIcon,
  CheckIcon,
  DesktopIcon,
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn(className, 'hover:bg-primary/10')}
        >
          <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-white' />
          <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white ' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='animate-in fade-in-80 slide-in-from-top-5 duration-200'
      >
        <ThemeMenuItem
          theme='light'
          currentTheme={theme}
          setTheme={(value) => {
            setTheme(value);
            setTimeout(() => setOpen(false), 200);
          }}
          label='Light'
          icon={<SunIcon className='h-4 w-4 mr-2' />}
        />
        <ThemeMenuItem
          theme='dark'
          currentTheme={theme}
          setTheme={(value) => {
            setTheme(value);
            setTimeout(() => setOpen(false), 200);
          }}
          label='Dark'
          icon={<MoonIcon className='h-4 w-4 mr-2' />}
        />
        <ThemeMenuItem
          theme='system'
          currentTheme={theme}
          setTheme={(value) => {
            setTheme(value);
            setTimeout(() => setOpen(false), 200);
          }}
          label='System'
          icon={<DesktopIcon className='h-4 w-4 mr-2' />}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ThemeMenuItemProps {
  theme: string;
  currentTheme: string | undefined;
  setTheme: (theme: string) => void;
  label: string;
  icon: React.ReactNode;
}

function ThemeMenuItem({
  theme,
  currentTheme,
  setTheme,
  label,
  icon,
}: ThemeMenuItemProps) {
  const isActive = theme === currentTheme;

  return (
    <DropdownMenuItem
      onClick={() => !isActive && setTheme(theme)}
      disabled={isActive}
      className={cn(
        isActive && 'bg-muted cursor-default font-medium',
        'flex justify-between items-center transition-colors'
      )}
    >
      <div className='flex items-center'>
        {icon}
        {label}
      </div>
      {isActive && (
        <CheckIcon className='h-4 w-4 ml-2 text-primary animate-in slide-in-from-left-3 duration-200' />
      )}
    </DropdownMenuItem>
  );
}
