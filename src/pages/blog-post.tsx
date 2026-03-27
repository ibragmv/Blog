import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LazyMarkdownRenderer } from '@/components/lazy-markdown';
import { PageLoader } from '@/components/page-loader';
import { buildDocumentTitle } from '@/lib/document';
import { type Post, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [readingProgress, setReadingProgress] = useState(0);

  const updateReadingProgress = useEffectEvent(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const nextProgress =
      scrollHeight > 0 ? Number(((window.scrollY / scrollHeight) * 100).toFixed(2)) : 0;

    setReadingProgress(nextProgress);
  });

  useEffect(() => {
    let frameId = 0;

    const scheduleReadingProgress = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateReadingProgress();
      });
    };

    scheduleReadingProgress();
    window.addEventListener('scroll', scheduleReadingProgress, { passive: true });
    window.addEventListener('resize', scheduleReadingProgress);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', scheduleReadingProgress);
      window.removeEventListener('resize', scheduleReadingProgress);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    setLoading(true);

    async function fetchPost() {
      if (!slug) {
        setPost(null);
        setLoading(false);
        document.title = buildDocumentTitle('Post not found');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) throw error;

        if (!isActive) {
          return;
        }

        setPost(data);
        setLanguage('ru');
        document.title = buildDocumentTitle(data?.title || 'Post not found');
      } catch (err) {
        if (isActive) {
          console.error('Error fetching post:', err);
          setPost(null);
          document.title = buildDocumentTitle('Post not found');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchPost();

    return () => {
      isActive = false;
    };
  }, [slug]);

  if (loading) {
    return <PageLoader className="h-64" />;
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 font-display">
          Post not found
        </h1>
        <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  const hasTranslation = !!post.title_en && !!post.content_en;
  const currentTitle = language === 'en' && post.title_en ? post.title_en : post.title;
  const currentContent = language === 'en' && post.content_en ? post.content_en : post.content;

  return (
    <article className="animate-in fade-in duration-500">
      <div
        className="fixed top-0 left-0 h-1 bg-zinc-300 dark:bg-zinc-700 z-50 transition-all duration-300 ease-out"
        style={{ width: `${readingProgress}%` }}
      />
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to writing
        </Link>
      </div>

      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display transition-all duration-300">
            {currentTitle}
          </h1>

          {hasTranslation && (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800 shrink-0 self-start">
              <button
                type="button"
                onClick={() => setLanguage('ru')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md transition-all',
                  language === 'ru'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                )}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md transition-all',
                  language === 'en'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                )}
              >
                EN
              </button>
            </div>
          )}
        </div>

        <time className="text-zinc-500 text-sm">
          {format(new Date(post.created_at), 'MMMM d, yyyy')}
        </time>
      </header>

      <div className="transition-opacity duration-300">
        <LazyMarkdownRenderer content={currentContent} preload />
      </div>
    </article>
  );
}
