import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Post } from '@/lib/supabase';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { format } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import { SITE_CONFIG } from '@/config';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

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
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 font-display">Post not found</h1>
        <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="animate-in fade-in duration-500">
      <Link 
        to="/blog" 
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-8 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to writing
      </Link>
      
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-zinc-100 font-display">
          {post.title}
        </h1>
        <time className="text-zinc-500 text-sm">
          {format(new Date(post.created_at), 'MMMM d, yyyy')}
        </time>
      </header>

      <MarkdownRenderer content={post.content} />
    </article>
  );
}
