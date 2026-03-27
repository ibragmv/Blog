import { type ComponentType, type LazyExoticComponent, lazy } from 'react';

type ComponentModule<T> = Promise<{ default: T }>;

function lazyWithPreload<T extends ComponentType<object>>(factory: () => ComponentModule<T>) {
  const Component = lazy(factory) as LazyExoticComponent<T> & {
    preload: typeof factory;
  };

  Component.preload = factory;

  return Component;
}

export const Home = lazyWithPreload(() => import('./pages/home'));
export const Blog = lazyWithPreload(() => import('./pages/blog'));
export const BlogPost = lazyWithPreload(() => import('./pages/blog-post'));
export const Links = lazyWithPreload(() => import('./pages/links'));
export const Login = lazyWithPreload(() => import('./pages/login'));
export const Admin = lazyWithPreload(() => import('./pages/admin'));
export const PostEditor = lazyWithPreload(() => import('./pages/post-editor'));
export const NotFound = lazyWithPreload(() => import('./pages/not-found'));

const routePreloaders: Record<string, (() => Promise<unknown>) | undefined> = {
  '/': Home.preload,
  '/blog': Blog.preload,
  '/links': Links.preload,
  '/login': Login.preload,
  '/admin': Admin.preload,
  '/admin/new': PostEditor.preload,
};

export function prefetchRoute(path: string) {
  if (path.startsWith('/blog/')) {
    return BlogPost.preload();
  }

  if (path.startsWith('/admin/edit/')) {
    return PostEditor.preload();
  }

  return routePreloaders[path]?.();
}

export function preloadBlogPostRoute() {
  return BlogPost.preload();
}
