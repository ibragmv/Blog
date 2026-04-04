import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MarkdownContainer,
  type MarkdownRendererProps,
  markdownComponents,
} from './markdown-shared';

export type { MarkdownRendererProps } from './markdown-shared';

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <MarkdownContainer className={className}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={markdownComponents}>
        {content}
      </Markdown>
    </MarkdownContainer>
  );
}
