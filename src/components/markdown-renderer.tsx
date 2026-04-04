import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { getMarkdownFeatures } from '@/lib/markdown-features';
import {
  MarkdownContainer,
  type MarkdownRendererProps,
  markdownComponents,
} from './markdown-shared';

export type { MarkdownRendererProps } from './markdown-shared';

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { hasCode, hasMath } = getMarkdownFeatures(content);
  const remarkPlugins = hasMath ? [remarkGfm, remarkMath] : [remarkGfm];
  const rehypePlugins = [...(hasCode ? [rehypeHighlight] : []), ...(hasMath ? [rehypeKatex] : [])];

  return (
    <MarkdownContainer className={className}>
      <Markdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        skipHtml
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </MarkdownContainer>
  );
}
