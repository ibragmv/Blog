'use client';

import { ArrowLeft, Languages, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/admin-auth-provider';
import { MarkdownEditor } from '@/components/markdown-editor';
import { PageLoader } from '@/components/page-loader';
import { AdminApiError, createAdminPost, getAdminPost, updateAdminPost } from '@/lib/admin-api';
import { TranslationApiError, translatePost } from '@/services/translation';

type PostEditorFormProps = { mode: 'create'; postId?: never } | { mode: 'edit'; postId: string };

export function PostEditorForm(props: PostEditorFormProps) {
  const router = useRouter();
  const isEditing = props.mode === 'edit';
  const editPostId = props.mode === 'edit' ? props.postId : null;
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [isPostLoading, setIsPostLoading] = useState(isEditing);

  const [titleRU, setTitleRU] = useState('');
  const [slug, setSlug] = useState('');
  const [contentRU, setContentRU] = useState('');
  const [titleEN, setTitleEN] = useState('');
  const [contentEN, setContentEN] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const adminEditorPath = isEditing && editPostId ? `/admin/edit/${editPostId}` : '/admin/new';

  useEffect(() => {
    if (!isEditing || !isAuthenticated || !editPostId) {
      return;
    }

    let cancelled = false;
    setIsPostLoading(true);

    getAdminPost(editPostId)
      .then((post) => {
        if (cancelled) {
          return;
        }

        setTitleRU(post.titleRU);
        setSlug(post.slug);
        setContentRU(post.contentRU);
        setTitleEN(post.titleEN || '');
        setContentEN(post.contentEN || '');
        setPublished(post.published);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof AdminApiError) {
          if (error.status === 404) {
            router.replace('/admin');
            return;
          }

          if (error.status === 401) {
            router.replace(`/login?next=${encodeURIComponent(`/admin/edit/${editPostId}`)}`);
            router.refresh();
            return;
          }
        }

        console.error('Failed to load post in editor.', error);
        router.replace('/admin');
      })
      .finally(() => {
        if (!cancelled) {
          setIsPostLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editPostId, isAuthenticated, isEditing, router]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleRU(event.target.value);
    if (!isEditing) {
      setSlug(generateSlug(event.target.value));
    }
  };

  const handleTranslate = async () => {
    if (!titleRU.trim() && !contentRU.trim()) {
      setTranslationError('Add a title or content to translate.');
      return;
    }

    setTranslating(true);
    setTranslationError(null);

    try {
      const translation = await translatePost({
        title: titleRU,
        content: contentRU,
      });

      setTitleEN(translation.titleEN ?? titleRU);
      setContentEN(translation.contentEN ?? contentRU);
    } catch (error) {
      if (error instanceof TranslationApiError && error.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(adminEditorPath)}`);
        router.refresh();
        return;
      }

      setTranslationError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setSubmitError(null);

    let finalTitleEN = titleEN;
    let finalContentEN = contentEN;

    const translationPromise =
      (!finalTitleEN || !finalContentEN) && (titleRU || contentRU)
        ? translatePost({
            title: finalTitleEN ? undefined : titleRU,
            content: finalContentEN ? undefined : contentRU,
          }).catch((translationFailure) => {
            console.error('Auto-translation failed', translationFailure);
            setTranslationError(
              translationFailure instanceof Error
                ? translationFailure.message
                : 'Auto-translation failed.'
            );
            return null;
          })
        : Promise.resolve(null);

    const translated = await translationPromise;

    if (translated) {
      if (!finalTitleEN) {
        finalTitleEN = translated.titleEN ?? titleRU;
      }
      if (!finalContentEN) {
        finalContentEN = translated.contentEN ?? contentRU;
      }
    }

    try {
      const payload = {
        titleRU,
        slug,
        contentRU,
        titleEN: finalTitleEN,
        contentEN: finalContentEN,
        published,
      };

      if (isEditing) {
        if (!editPostId) {
          throw new Error('Missing post id.');
        }

        await updateAdminPost(editPostId, payload);
      } else {
        await createAdminPost(payload);
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      if (error instanceof AdminApiError && error.status === 401) {
        router.replace('/login?next=/admin');
        router.refresh();
        return;
      }

      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || isLoading || (isEditing && isPostLoading)) {
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
            <label htmlFor="titleRU" className="block text-sm font-medium text-zinc-400">
              Title (Russian)
            </label>
            <input
              id="titleRU"
              type="text"
              value={titleRU}
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
          id="contentRU"
          label="Content (Russian - Markdown)"
          value={contentRU}
          onChange={setContentRU}
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
                disabled={translating || (!titleRU.trim() && !contentRU.trim())}
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
              <label htmlFor="titleEN" className="block text-sm font-medium text-zinc-400">
                Title (English)
              </label>
              <input
                id="titleEN"
                type="text"
                value={titleEN}
                onChange={(event) => setTitleEN(event.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600"
                placeholder="Auto-translated title will appear here..."
              />
            </div>

            <MarkdownEditor
              id="contentEN"
              label="Content (English - Markdown)"
              value={contentEN}
              onChange={setContentEN}
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

          <div className="flex flex-col items-end gap-2">
            {submitError && <p className="text-sm text-red-300">{submitError}</p>}

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
        </div>
      </form>
    </div>
  );
}
