import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {
  MarkdownContainer,
  type MarkdownRendererProps,
  markdownComponents,
} from './markdown-shared';

export function MarkdownRendererRich({ content, className }: MarkdownRendererProps) {
  return (
    <MarkdownContainer className={className}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </MarkdownContainer>
  );
}
