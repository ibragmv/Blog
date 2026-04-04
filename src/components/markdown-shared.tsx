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

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function sanitizeMarkdownUrl(url?: string | Blob) {
  if (typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  // Allow relative URLs, hash links, and protocol-relative URLs.
  if (!SCHEME_PATTERN.test(trimmedUrl)) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    return ALLOWED_URL_PROTOCOLS.has(parsedUrl.protocol) ? trimmedUrl : null;
  } catch {
    return null;
  }
}

export const markdownComponents: Components = {
  a: ({ node, href, children, ...props }) => {
    const safeHref = sanitizeMarkdownUrl(href);

    if (!safeHref) {
      return <span className="text-[var(--text-secondary)]">{children}</span>;
    }

    return (
      <a
        {...props}
        href={safeHref}
        className="text-[var(--interactive)] underline underline-offset-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  img: ({ node, src, alt = '', ...props }) => {
    const safeSrc = sanitizeMarkdownUrl(src);

    if (!safeSrc) {
      return null;
    }

    // biome-ignore lint/performance/noImgElement: Markdown images can be arbitrary external or relative assets without known dimensions.
    return <img {...props} src={safeSrc} alt={alt} />;
  },
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
