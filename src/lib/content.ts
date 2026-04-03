export type PostRecord = {
  id: string;
  titleRU: string;
  titleEN?: string;
  slug: string;
  contentRU: string;
  contentEN?: string;
  createdAt: number;
  updatedAt: number;
  published: boolean;
  isPage: boolean;
};

export type ContentLanguage = 'ru' | 'en';

export function getPrimaryPostTitle(post: Pick<PostRecord, 'titleRU' | 'titleEN'>) {
  return post.titleEN || post.titleRU;
}

export function getPrimaryPostContent(post: Pick<PostRecord, 'contentRU' | 'contentEN'>) {
  return post.contentEN || post.contentRU;
}

export function getDefaultContentLanguage(
  post: Pick<PostRecord, 'titleEN' | 'contentEN'> | null | undefined
): ContentLanguage {
  return post?.titleEN && post.contentEN ? 'en' : 'ru';
}

export type LinkRecord = {
  id: string;
  title: string;
  url: string;
  icon: string;
  order: number;
  createdAt: number;
};

export type AdminSession = {
  authenticated: boolean;
  email: string | null;
  sessionToken: string | null;
};
