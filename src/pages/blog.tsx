import { format } from 'date-fns';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Post, supabase } from '@/lib/supabase';
import { preloadBlogPostRoute } from '@/route-components';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .neq('slug', 'home')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
          Writing
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-zinc-500">No posts found matching your search.</p>
      ) : (
        <div className="grid gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              onMouseEnter={preloadBlogPostRoute}
              onFocus={preloadBlogPostRoute}
              className="group block"
            >
              <article className="space-y-2">
                <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
                  {post.title}
                </h2>
                <div className="text-sm text-zinc-500">
                  {format(new Date(post.created_at), 'MMMM d, yyyy')}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 text-sm leading-relaxed">
                  {/* Simple strip markdown for preview - naive approach */}
                  {post.content.replace(/[#*`]/g, '').slice(0, 150)}...
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
