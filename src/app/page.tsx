import { LazyMarkdownRenderer } from '@/components/lazy-markdown';
import { getHomePagePost } from '@/lib/server/data';

const HOME_FALLBACK_CONTENT =
  '# Welcome\n\nThis is the home page. You can edit this content in the admin panel by creating a post with the slug `home`.';

export default async function HomePage() {
  const homePost = await getHomePagePost();
  const content = homePost?.content || HOME_FALLBACK_CONTENT;

  return (
    <div className="animate-in fade-in duration-500">
      <LazyMarkdownRenderer content={content} preload />
    </div>
  );
}
