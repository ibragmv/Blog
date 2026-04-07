'use client';

import { Edit2, FileText, Link as LinkIcon, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/admin-auth-provider';
import { AdminNotice } from '@/components/admin-notice';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { LinksManager } from '@/components/links-manager';
import { PageLoader } from '@/components/page-loader';
import { deleteAdminPost, getAdminPosts, isAdminRequestAbortError } from '@/lib/admin-api';
import {
  ADMIN_SERVICE_UNAVAILABLE_TITLE,
  getAdminServiceUnavailableMessage,
  isAdminServiceUnavailableError,
  isAdminSessionExpiredError,
} from '@/lib/admin-client-auth';
import { useAdminNoticePreview } from '@/lib/admin-notice-preview';
import type { PostRecord } from '@/lib/content';
import { formatShortUtcDate } from '@/lib/dates';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'posts' | 'links'>('posts');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [posts, setPosts] = useState<PostRecord[] | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [isPostsServiceUnavailable, setIsPostsServiceUnavailable] = useState(false);
  const router = useRouter();
  const { handleUnauthorized, isAuthenticated, isLoading, signOut } = useAdminAuth();
  const previewNotice = useAdminNoticePreview();

  useEffect(() => {
    if (!isAuthenticated || isSigningOut || activeTab !== 'posts') {
      return;
    }

    const controller = new AbortController();
    setPosts(null);
    setPostsError(null);
    setIsPostsServiceUnavailable(false);

    getAdminPosts({ signal: controller.signal })
      .then((nextPosts) => {
        if (!controller.signal.aborted) {
          setPosts(nextPosts);
        }
      })
      .catch((error) => {
        if (controller.signal.aborted || isAdminRequestAbortError(error)) {
          return;
        }

        if (isAdminSessionExpiredError(error)) {
          handleUnauthorized('/admin');
          return;
        }

        const isServiceUnavailable = isAdminServiceUnavailableError(error);
        setIsPostsServiceUnavailable(isServiceUnavailable);
        setPostsError(
          isServiceUnavailable
            ? getAdminServiceUnavailableMessage(error)
            : error instanceof Error
              ? error.message
              : 'Failed to load posts.'
        );
        setPosts([]);
      });

    return () => {
      controller.abort();
    };
  }, [activeTab, handleUnauthorized, isAuthenticated, isSigningOut]);

  const handleDelete = async (id: string) => {
    setPostsError(null);
    setIsPostsServiceUnavailable(false);

    try {
      await deleteAdminPost(id);
      setPosts((currentPosts) => currentPosts?.filter((post) => post.id !== id) ?? []);
    } catch (error) {
      if (isAdminSessionExpiredError(error)) {
        handleUnauthorized('/admin');
        return;
      }

      const isServiceUnavailable = isAdminServiceUnavailableError(error);
      setIsPostsServiceUnavailable(isServiceUnavailable);
      setPostsError(
        isServiceUnavailable
          ? getAdminServiceUnavailableMessage(error)
          : error instanceof Error
            ? error.message
            : 'Failed to delete post.'
      );
    }
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    setPostsError(null);

    try {
      await signOut();
      router.replace('/login');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading || isSigningOut || (isAuthenticated && activeTab === 'posts' && posts === null)) {
    return <PageLoader className="h-64" />;
  }

  if (!isAuthenticated) {
    return <PageLoader className="h-64" />;
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

      {previewNotice ? (
        <AdminNotice title={previewNotice.title}>{previewNotice.message}</AdminNotice>
      ) : null}

      {activeTab === 'posts' && postsError ? (
        <AdminNotice
          title={isPostsServiceUnavailable ? ADMIN_SERVICE_UNAVAILABLE_TITLE : undefined}
        >
          {postsError}
        </AdminNotice>
      ) : null}

      {activeTab === 'posts' ? (
        <>
          <div className="flex justify-between items-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-200 flex-1 mr-4">
              <strong>Tip:</strong> To edit the <b>Home</b> page, create or edit a post with the
              slug <code>home</code>.
            </div>
            <Link
              href="/admin/new"
              className="flex items-center px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium whitespace-nowrap"
            >
              <Plus size={16} className="mr-2" />
              New Post
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
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
                {(posts ?? []).map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                      {post.titleRU}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{post.slug}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatShortUtcDate(post.createdAt)}
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
                        <Link
                          href={`/admin/edit/${post.id}`}
                          className="p-2 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <ConfirmDeleteButton
                          onDelete={() => handleDelete(post.id)}
                          title="Delete post"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts && posts.length === 0 && (
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
