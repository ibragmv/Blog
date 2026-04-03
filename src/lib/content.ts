export type PostRecord = {
  id: string;
  title: string;
  titleEn?: string;
  slug: string;
  contentRU: string;
  contentEN?: string;
  createdAt: number;
  updatedAt: number;
  published: boolean;
  isPage: boolean;
};

export function getPreferredPostTitle(post: Pick<PostRecord, 'title' | 'titleEn'>) {
  return post.titleEn || post.title;
}

export function getPreferredPostContent(post: Pick<PostRecord, 'contentRU' | 'contentEN'>) {
  return post.contentEN || post.contentRU;
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
