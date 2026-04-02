export type MarkdownFeatureSet = {
  hasCode: boolean;
  hasMath: boolean;
  hasRawHtml: boolean;
};

const CODE_BLOCK_PATTERN = /```|~~~|(^|\n)( {4,}|\t)\S/m;
const INLINE_MATH_PATTERN = /(^|[^\\])\$[^$\n]+\$/m;
const BLOCK_MATH_PATTERN = /\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/m;
const RAW_HTML_PATTERN =
  /<([A-Za-z][\w:-]*)(\s[^>]*)?>[\s\S]*?<\/\1>|<([A-Za-z][\w:-]*)(\s[^>]*)?\/?>/m;

export function getMarkdownFeatures(content: string): MarkdownFeatureSet {
  return {
    hasCode: CODE_BLOCK_PATTERN.test(content),
    hasMath: INLINE_MATH_PATTERN.test(content) || BLOCK_MATH_PATTERN.test(content),
    hasRawHtml: RAW_HTML_PATTERN.test(content),
  };
}
