import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PageLoaderProps = {
  className?: string;
  label?: string;
};

export function PageLoader({ className, label = 'Loading page content' }: PageLoaderProps) {
  return (
    <output
      className={cn('flex min-h-[40vh] items-center justify-center', className)}
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-300" />
      <span className="sr-only">{label}</span>
    </output>
  );
}
