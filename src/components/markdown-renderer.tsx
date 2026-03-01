import React from 'react';
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-zinc dark:prose-invert max-w-none", className)}>
      <Markdown
        components={{
          // Custom styling for specific elements if needed
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-400 hover:underline underline-offset-4" target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
