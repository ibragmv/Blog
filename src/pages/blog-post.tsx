import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { SITE_CONFIG } from '@/config';
import { type Post, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateReadingProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setReadingProgress(Number((currentScroll / scrollHeight).toFixed(2)) * 100);
      }
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;

      try {
        const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single();

        if (error) throw error;
        setPost(data);
        // Update document title for the post
        if (data) {
          document.title = `${data.title} ${SITE_CONFIG.titleSeparator} ${SITE_CONFIG.title}`;
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-zinc-600" />
      </div>
    );
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
        className="fixed top-0 left-0 h-1 bg-blue-600 z-50 transition-all duration-100 ease-out"
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

        {hasTranslation && (
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
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

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-zinc-100 font-display transition-all duration-300">
          {currentTitle}
        </h1>
        <time className="text-zinc-500 text-sm">
          {format(new Date(post.created_at), 'MMMM d, yyyy')}
        </time>
      </header>

      <div className="transition-opacity duration-300">
        <MarkdownRenderer content={currentContent} />
      </div>
    </article>
  );
}
