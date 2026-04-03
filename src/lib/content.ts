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

export function getPreferredPostTitle(post: Pick<PostRecord, 'titleRU' | 'titleEN'>) {
  return post.titleEN || post.titleRU;
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
