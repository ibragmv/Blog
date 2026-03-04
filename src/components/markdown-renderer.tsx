import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { cn } from '@/lib/utils';

// Import styles for syntax highlighting and math
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn('prose prose-zinc dark:prose-invert max-w-none wrap-break-words', className)}
    >
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
        components={{
          // Custom styling for specific elements if needed
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-blue-400 hover:underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          // Ensure tables are responsive
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table {...props} className="min-w-full divide-y divide-zinc-700" />
            </div>
          ),
          // Style blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-zinc-500 pl-4 italic text-zinc-400"
            />
          ),
          // Style code blocks (inline code is handled by prose)
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            // Check if it's inline: no language class, children is string (not highlighted nodes), and no newlines
            const isInline =
              !match && typeof children === 'string' && !String(children).includes('\n');

            if (isInline) {
              return (
                <code
                  className={cn(
                    'bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-200',
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
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
