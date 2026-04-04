import { getMarkdownFeatures } from '@/lib/markdown-features';
import { MarkdownRenderer, type MarkdownRendererProps } from './markdown-renderer';
import { MarkdownRendererCode } from './markdown-renderer-code';
import { MarkdownRendererMath } from './markdown-renderer-math';
import { MarkdownRendererRaw } from './markdown-renderer-raw';
import { MarkdownRendererRich } from './markdown-renderer-rich';

export function MarkdownContent(props: MarkdownRendererProps) {
  const { hasCode, hasMath, hasRawHtml } = getMarkdownFeatures(props.content);

  if ((hasCode && hasMath) || (hasCode && hasRawHtml) || (hasMath && hasRawHtml)) {
    return <MarkdownRendererRich {...props} />;
  }

  if (hasCode) {
    return <MarkdownRendererCode {...props} />;
  }

  if (hasMath) {
    return <MarkdownRendererMath {...props} />;
  }

  if (hasRawHtml) {
    return <MarkdownRendererRaw {...props} />;
  }

  return <MarkdownRenderer {...props} />;
}
