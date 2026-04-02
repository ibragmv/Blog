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
      <span className="nd-label rounded-full border border-[var(--border-visible)] px-4 py-3 text-[var(--text-secondary)]">
        [ LOADING... ]
      </span>
      <span className="sr-only">{label}</span>
    </output>
  );
}
