import { format } from 'date-fns';
import { Edit2, FileText, Link as LinkIcon, Loader2, LogOut, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinksManager } from '@/components/links-manager';
import { type Post, supabase } from '@/lib/supabase';

function DeleteButton({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  const [status, setStatus] = useState<'idle' | 'confirm' | 'deleting'>('idle');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === 'idle') {
      setStatus('confirm');
      // Reset after 3 seconds if not confirmed
      setTimeout(() => setStatus((prev) => (prev === 'confirm' ? 'idle' : prev)), 3000);
    } else if (status === 'confirm') {
      setStatus('deleting');
      onDelete(id);
    }
  };

  if (status === 'confirm') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="px-2 py-1 text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
        title="Click again to confirm"
      >
        <span className="text-xs font-bold">Confirm?</span>
        <Trash2 size={14} />
      </button>
    );
  }

  if (status === 'deleting') {
    return (
      <button type="button" className="p-2 text-zinc-600 cursor-wait" disabled>
        <Loader2 size={16} className="animate-spin" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  );
}

export default function Admin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'links'>('posts');
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate('/login');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session && activeTab === 'posts') fetchPosts();
  }, [session, activeTab, fetchPosts]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      setPosts((currentPosts) => currentPosts.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-display">
          Admin Dashboard
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'posts'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          <FileText size={16} className="mr-2" />
          Posts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'links'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          <LinkIcon size={16} className="mr-2" />
          Links
        </button>
      </div>

      {activeTab === 'posts' ? (
        <>
          <div className="flex justify-between items-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-200 flex-1 mr-4">
              <strong>Tip:</strong> To edit the <b>Home</b> page, create or edit a post with the
              slug <code>home</code>.
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/new')}
              className="flex items-center px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium whitespace-nowrap"
            >
              <Plus size={16} className="mr-2" />
              New Post
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-zinc-600" />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium text-zinc-500">Title</th>
                    <th className="px-6 py-4 font-medium text-zinc-500">Slug</th>
                    <th className="px-6 py-4 font-medium text-zinc-500">Date</th>
                    <th className="px-6 py-4 font-medium text-zinc-500">Status</th>
                    <th className="px-6 py-4 font-medium text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{post.slug}</td>
                      <td className="px-6 py-4 text-zinc-500">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.published
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/edit/${post.id}`)}
                            className="p-2 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <DeleteButton id={post.id} onDelete={handleDelete} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && posts.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                No posts found. Create your first one!
              </div>
            )}
          </div>
        </>
      ) : (
        <LinksManager />
      )}
    </div>
  );
}
