import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import { LazyMarkdownRenderer } from '@/components/lazy-markdown';
import { PageLoader } from '@/components/page-loader';

const HOME_FALLBACK_CONTENT =
  '# Welcome\n\nThis is the home page. You can edit this content in the admin panel by creating a post with the slug `home`.';

export default function Home() {
  const homePost = useQuery(api.posts.getHomePage, {});

  if (homePost === undefined) {
    return <PageLoader className="h-64" />;
  }

  const content = homePost?.content || HOME_FALLBACK_CONTENT;

  return (
    <div className="animate-in fade-in duration-500">
      <LazyMarkdownRenderer content={content} preload />
    </div>
  );
}
