import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        if (data) {
          setContent(data.content);
        } else {
          setContent(
            '# Welcome\n\nThis is the home page. You can edit this content in the admin panel by creating a post with the slug `home`.'
          );
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeContent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <MarkdownRenderer content={content} />
    </div>
  );
}
