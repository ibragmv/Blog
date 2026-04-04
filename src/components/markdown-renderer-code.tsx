import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import {
  MarkdownContainer,
  type MarkdownRendererProps,
  markdownComponents,
} from './markdown-shared';

export function MarkdownRendererCode({ content, className }: MarkdownRendererProps) {
  return (
    <MarkdownContainer className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        skipHtml
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </MarkdownContainer>
  );
}
