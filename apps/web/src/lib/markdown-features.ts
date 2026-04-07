export type MarkdownFeatureSet = {
  hasCode: boolean;
  hasMath: boolean;
};

const CODE_BLOCK_PATTERN = /```|~~~|(^|\n)( {4,}|\t)\S/m;
const INLINE_MATH_PATTERN = /(^|[^\\])\$[^$\n]+\$/m;
const BLOCK_MATH_PATTERN = /\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/m;

export function getMarkdownFeatures(content: string): MarkdownFeatureSet {
  return {
    hasCode: CODE_BLOCK_PATTERN.test(content),
    hasMath: INLINE_MATH_PATTERN.test(content) || BLOCK_MATH_PATTERN.test(content),
  };
}
