import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Languages, Loader2, Save } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '@/components/admin-auth-provider';
import { MarkdownEditor } from '@/components/markdown-editor';
import { PageLoader } from '@/components/page-loader';
import { testConnection, translatePost } from '@/services/translation';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { isAuthenticated, isLoading, sessionToken } = useAdminAuth();
  const savePost = useMutation(api.posts.save);
  const post = useQuery(
    api.posts.getAdminById,
    isEditing && sessionToken && id ? { sessionToken, postId: id as Id<'posts'> } : 'skip'
  );

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    if (post === undefined) {
      return;
    }

    if (!post) {
      navigate('/admin');
      return;
    }

    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setTitleEn(post.titleEn || '');
    setContentEn(post.contentEn || '');
    setPublished(post.published);
  }, [isEditing, navigate, post]);

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

  const handleTestConnection = async () => {
    const result = await testConnection();
    alert(result.message);
  };

  const handleTranslate = async () => {
    if (!title && !content) return;

    setTranslating(true);
    setTranslationError(null);
    try {
      const { title_en, content_en } = await translatePost(title, content);
      setTitleEn(title_en);
      setContentEn(content_en);
    } catch (error: unknown) {
      console.error('Translation failed', error);
      if (error instanceof Error) {
        setTranslationError(error.message);
      } else {
        setTranslationError('An unknown error occurred');
      }
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Auto-translate if English fields are empty
    let finalTitleEn = titleEn;
    let finalContentEn = contentEn;

    if ((!finalTitleEn || !finalContentEn) && (title || content)) {
      try {
        const { title_en, content_en } = await translatePost(title, content);
        if (!finalTitleEn) finalTitleEn = title_en;
        if (!finalContentEn) finalContentEn = content_en;
      } catch (error) {
        console.error('Auto-translation failed', error);
      }
    }

    const postData = {
      sessionToken: sessionToken || '',
      ...(isEditing && id ? { postId: id as Id<'posts'> } : {}),
      title,
      slug,
      content,
      titleEn: finalTitleEn,
      contentEn: finalContentEn,
      published,
    };

    try {
      await savePost(postData);
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Error saving post:', err);
      if (err instanceof Error) {
        alert(`Error saving post: ${err.message}`);
      } else {
        alert('Error saving post: An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (isEditing && post === undefined)) {
    return <PageLoader className="h-64" />;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
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
            <label htmlFor="title" className="block text-sm font-medium text-zinc-400">
              Title (Russian)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-zinc-400">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600 font-mono text-sm"
              required
            />
          </div>
        </div>

        <MarkdownEditor
          id="content"
          label="Content (Russian - Markdown)"
          value={content}
          onChange={setContent}
          placeholder="# Write your post here..."
          rows={15}
        />

        {/* Translation Section */}
        <div className="border-t border-zinc-800 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-zinc-200">English Translation</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 text-zinc-400 rounded hover:bg-zinc-800 transition-colors"
              >
                Debug Connection
              </button>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating || !title || !content}
                className="flex items-center px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {translating ? (
                  <Loader2 className="animate-spin mr-2" size={14} />
                ) : (
                  <Languages className="mr-2" size={14} />
                )}
                Translate Now
              </button>
            </div>
          </div>

          {translationError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-md text-red-200 text-sm">
              <strong>Error:</strong> {translationError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label htmlFor="titleEn" className="block text-sm font-medium text-zinc-400">
                Title (English)
              </label>
              <input
                id="titleEn"
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600"
                placeholder="Auto-translated title will appear here..."
              />
            </div>

            <MarkdownEditor
              id="contentEn"
              label="Content (English - Markdown)"
              value={contentEn}
              onChange={setContentEn}
              placeholder="Auto-translated content will appear here..."
              rows={15}
            />
          </div>
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
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Save className="mr-2" size={16} />
            )}
            Save Post
          </button>
        </div>
      </form>
    </div>
  );
}
