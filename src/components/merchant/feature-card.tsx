import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white p-6',
        'shadow-sm hover:shadow-md transition-all duration-200 ease-in-out',
        'hover:border-primary/30 hover:-translate-y-0.5',
        'dark:bg-background dark:hover:border-foreground/50',
        className
      )}
    >
      <div className='flex items-center gap-4'>
        <div className='rounded-lg bg-primary/10 p-2.5 ring-1 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 transition-colors'>
          <Icon className='h-6 w-6 text-primary' />
        </div>
        <h3 className='font-semibold text-lg tracking-tight text-foreground/90'>
          {title}
        </h3>
      </div>
      <p className='mt-3 text-foreground/60 leading-relaxed'>{description}</p>
    </div>
  );
}
