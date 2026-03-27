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
  return (
    <div
      className={cn('prose prose-zinc dark:prose-invert max-w-none wrap-break-words', className)}
    >
      {children}
    </div>
  );
}

export const markdownComponents: Components = {
  a: ({ node, ...props }) => (
    <a
      {...props}
      className="text-blue-400 hover:underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  table: ({ node, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table {...props} className="min-w-full divide-y divide-zinc-700" />
    </div>
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote {...props} className="border-l-4 border-zinc-500 pl-4 italic text-zinc-400" />
  ),
  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && typeof children === 'string' && !String(children).includes('\n');

    if (isInline) {
      return (
        <code
          className={cn(
            'rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-zinc-200',
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
