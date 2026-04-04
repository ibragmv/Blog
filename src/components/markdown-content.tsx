import { getMarkdownFeatures } from '@/lib/markdown-features';
import { MarkdownRenderer, type MarkdownRendererProps } from './markdown-renderer';
import { MarkdownRendererCode } from './markdown-renderer-code';
import { MarkdownRendererCodeMath } from './markdown-renderer-code-math';
import { MarkdownRendererMath } from './markdown-renderer-math';

export function MarkdownContent(props: MarkdownRendererProps) {
  const { hasCode, hasMath } = getMarkdownFeatures(props.content);

  if (hasCode && hasMath) {
    return <MarkdownRendererCodeMath {...props} />;
  }

  if (hasCode) {
    return <MarkdownRendererCode {...props} />;
  }

  if (hasMath) {
    return <MarkdownRendererMath {...props} />;
  }

  return <MarkdownRenderer {...props} />;
}
