import { z } from 'zod';

export const PostRecordSchema = z.object({
  id: z.string(),
  titleRU: z.string(),
  titleEN: z.string().optional(),
  slug: z.string(),
  contentRU: z.string(),
  contentEN: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  published: z.boolean(),
  isPage: z.boolean(),
});

export type PostRecord = z.infer<typeof PostRecordSchema>;

export const ContentLanguageSchema = z.enum(['ru', 'en']);

export type ContentLanguage = z.infer<typeof ContentLanguageSchema>;

export function getPrimaryPostTitle(post: Pick<PostRecord, 'titleRU' | 'titleEN'>): string {
  return post.titleEN || post.titleRU;
}

export function getPrimaryPostContent(post: Pick<PostRecord, 'contentRU' | 'contentEN'>): string {
  return post.contentEN || post.contentRU;
}

export function getDefaultContentLanguage(
  post: Pick<PostRecord, 'titleEN' | 'contentEN'> | null | undefined
): ContentLanguage {
  return post?.titleEN && post.contentEN ? 'en' : 'ru';
}

export function parseContentLanguage(value?: string | string[] | null): ContentLanguage | null {
  if (typeof value !== 'string') {
    return null;
  }

  const parsedValue = ContentLanguageSchema.safeParse(value);
  return parsedValue.success ? parsedValue.data : null;
}

export function resolveContentLanguage(
  requestedLanguage: ContentLanguage | null,
  defaultLanguage: ContentLanguage,
  hasTranslation: boolean
): ContentLanguage {
  if (!hasTranslation) {
    return defaultLanguage;
  }

  return requestedLanguage ?? defaultLanguage;
}

export const LinkRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  icon: z.string(),
  order: z.number(),
  createdAt: z.number(),
});

export type LinkRecord = z.infer<typeof LinkRecordSchema>;

export const AdminPostDraftSchema = z.object({
  titleRU: z.string(),
  titleEN: z.string().optional(),
  slug: z.string(),
  contentRU: z.string(),
  contentEN: z.string().optional(),
  published: z.boolean(),
});

export type AdminPostDraft = z.infer<typeof AdminPostDraftSchema>;

export const AdminLinkDraftSchema = z.object({
  title: z.string(),
  url: z.string(),
  icon: z.string(),
  order: z.number(),
});

export type AdminLinkDraft = z.infer<typeof AdminLinkDraftSchema>;

export const AdminSessionSchema = z.object({
  authenticated: z.boolean(),
  email: z.string().nullable(),
});

export type AdminSession = z.infer<typeof AdminSessionSchema>;

export const AdminIdResponseSchema = z.object({
  id: z.string(),
});

export const AdminDeleteSuccessResponseSchema = z.object({
  success: z.literal(true),
});

export const AdminErrorResponseSchema = z.object({
  error: z.string(),
});
