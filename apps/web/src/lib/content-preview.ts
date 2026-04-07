const FENCED_CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
const INLINE_CODE_PATTERN = /`([^`]+)`/g;
const LINK_PATTERN = /\[([^\]]+)\]\([^)]+\)/g;
const IMAGE_PATTERN = /!\[[^\]]*\]\([^)]+\)/g;
const MARKDOWN_DECORATOR_PATTERN = /[#>*_~|-]/g;
const MULTIPLE_SPACES_PATTERN = /\s+/g;

export function extractContentPreview(content: string, length = 150) {
  const plainText = content
    .replace(FENCED_CODE_BLOCK_PATTERN, ' ')
    .replace(INLINE_CODE_PATTERN, '$1')
    .replace(IMAGE_PATTERN, ' ')
    .replace(LINK_PATTERN, '$1')
    .replace(MARKDOWN_DECORATOR_PATTERN, ' ')
    .replace(MULTIPLE_SPACES_PATTERN, ' ')
    .trim();

  if (plainText.length <= length) {
    return plainText;
  }

  return `${plainText.slice(0, length).trimEnd()}...`;
}
