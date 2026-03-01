import React, { useEffect, useState } from 'react';
import { supabase, type Post } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
    });
  }, [navigate]);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    } else {
      setFetching(false);
    }
  }, [id]);

  async function fetchPost() {
    try {
      if (!id) return;
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content);
        setPublished(data.published);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      navigate('/admin');
    } finally {
      setFetching(false);
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!isEditing) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const postData = {
      title,
      slug,
      content,
      published,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditing && id) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
        if (error) throw error;
      }
      navigate('/admin');
    } catch (err: any) {
      console.error('Error saving post:', err);
      alert(`Error saving post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-zinc-100">{isEditing ? 'Edit Post' : 'New Post'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600 font-mono text-sm"
              required
            />
            <p className="text-xs text-zinc-500">Unique identifier for the URL (e.g., my-first-post)</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-400">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600 font-mono text-sm leading-relaxed"
            placeholder="# Write your post here..."
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-zinc-100 focus:ring-zinc-700"
            />
            <span className="text-sm font-medium text-zinc-400">Published</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
            Save Post
          </button>
        </div>
      </form>
    </div>
  );
}
