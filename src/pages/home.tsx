import { useEffect, useState } from 'react';
import { LazyMarkdownRenderer } from '@/components/lazy-markdown';
import { PageLoader } from '@/components/page-loader';
import { supabase } from '@/lib/supabase';

const HOME_FALLBACK_CONTENT =
  '# Welcome\n\nThis is the home page. You can edit this content in the admin panel by creating a post with the slug `home`.';

export default function Home() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function fetchHomeContent() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('content')
          .eq('slug', 'home')
          .maybeSingle();

        if (error) {
          console.error('Error fetching home content:', error);
        }

        if (!isActive) {
          return;
        }

        if (data) {
          setContent(data.content);
        } else {
          setContent(HOME_FALLBACK_CONTENT);
        }
      } catch (err) {
        if (isActive) {
          console.error('Unexpected error:', err);
          setContent(HOME_FALLBACK_CONTENT);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchHomeContent();

    return () => {
      isActive = false;
    };
  }, []);

  if (loading) {
    return <PageLoader className="h-64" />;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <LazyMarkdownRenderer content={content} preload />
    </div>
  );
}
