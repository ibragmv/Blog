import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  MarkdownContainer,
  type MarkdownRendererProps,
  markdownComponents,
} from './markdown-shared';

export function MarkdownRendererRaw({ content, className }: MarkdownRendererProps) {
  return (
    <MarkdownContainer className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </MarkdownContainer>
  );
}
