'use client';

import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Languages, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/admin-auth-provider';
import { MarkdownEditor } from '@/components/markdown-editor';
import { PageLoader } from '@/components/page-loader';
import { translatePost } from '@/services/translation';

type PostEditorFormProps = { mode: 'create'; postId?: never } | { mode: 'edit'; postId: string };

export function PostEditorForm(props: PostEditorFormProps) {
  const router = useRouter();
  const isEditing = props.mode === 'edit';
  const { isAuthenticated, isLoading, sessionToken } = useAdminAuth();
  const savePost = useMutation(api.posts.save);
  const post = useQuery(
    api.posts.getAdminById,
    isEditing && sessionToken ? { sessionToken, postId: props.postId as Id<'posts'> } : 'skip'
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
    if (isEditing && post === null) {
      router.replace('/admin');
    }
  }, [isEditing, post, router]);

  useEffect(() => {
    if (!isEditing || !post) {
      return;
    }

    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setTitleEn(post.titleEn || '');
    setContentEn(post.contentEn || '');
    setPublished(post.published);
  }, [isEditing, post]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    if (!isEditing) {
      setSlug(generateSlug(event.target.value));
    }
  };

  const handleTranslate = async () => {
    if (!title && !content) {
      return;
    }

    setTranslating(true);
    setTranslationError(null);

    try {
      const { title_en, content_en } = await translatePost(title, content);
      setTitleEn(title_en);
      setContentEn(content_en);
    } catch (error) {
      setTranslationError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!sessionToken) {
      return;
    }

    setLoading(true);

    let finalTitleEn = titleEn;
    let finalContentEn = contentEn;

    const translationPromise =
      (!finalTitleEn || !finalContentEn) && (title || content)
        ? translatePost(title, content).catch((translationFailure) => {
            console.error('Auto-translation failed', translationFailure);
            return null;
          })
        : Promise.resolve(null);

    const translated = await translationPromise;

    if (translated) {
      if (!finalTitleEn) {
        finalTitleEn = translated.title_en;
      }
      if (!finalContentEn) {
        finalContentEn = translated.content_en;
      }
    }

    try {
      await savePost({
        sessionToken,
        ...(isEditing ? { postId: props.postId as Id<'posts'> } : {}),
        title,
        slug,
        content,
        titleEn: finalTitleEn,
        contentEn: finalContentEn,
        published,
      });

      router.push('/admin');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      window.alert(`Error saving post: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || isLoading || (isEditing && post === undefined)) {
    return <PageLoader className="h-64" />;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <Link href="/admin" className="flex items-center text-sm text-zinc-500 hover:text-zinc-300">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
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
              onChange={(event) => setSlug(event.target.value)}
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

        <div className="border-t border-zinc-800 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-zinc-200">English Translation</h3>
            <div className="flex gap-2">
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
                onChange={(event) => setTitleEn(event.target.value)}
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
              onChange={(event) => setPublished(event.target.checked)}
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
