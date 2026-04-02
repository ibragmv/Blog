import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {
  MarkdownContainer,
  type MarkdownRendererProps,
  markdownComponents,
} from './markdown-shared';

export function MarkdownRendererMath({ content, className }: MarkdownRendererProps) {
  return (
    <MarkdownContainer className={className}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </MarkdownContainer>
  );
}
