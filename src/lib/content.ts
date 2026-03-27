export type PostRecord = {
  id: string;
  title: string;
  titleEn?: string;
  slug: string;
  summary?: string;
  content: string;
  contentEn?: string;
  createdAt: number;
  updatedAt: number;
  published: boolean;
  isPage: boolean;
};

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
