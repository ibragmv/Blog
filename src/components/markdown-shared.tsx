import type { ReactNode } from 'react';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/utils';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('prose max-w-none break-words', className)}>{children}</div>;
}

export const markdownComponents: Components = {
  a: ({ node, ...props }) => (
    <a
      {...props}
      className="text-[var(--interactive)] underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  table: ({ node, ...props }) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <table {...props} className="min-w-full" />
    </div>
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      {...props}
      className="border-l border-[var(--border-visible)] pl-6 text-[var(--text-secondary)]"
    />
  ),
  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && typeof children === 'string' && !String(children).includes('\n');

    if (isInline) {
      return (
        <code
          className={cn(
            'rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]',
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};
