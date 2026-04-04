'use client';

import {
  Edit2,
  Github,
  Globe,
  Linkedin,
  Link as LinkIcon,
  Loader2,
  Mail,
  Plus,
  Save,
  Twitter,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/admin-auth-provider';
import { AdminNotice } from '@/components/admin-notice';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import {
  AdminApiError,
  createAdminLink,
  deleteAdminLink,
  getAdminLinks,
  updateAdminLink,
} from '@/lib/admin-api';
import type { LinkRecord } from '@/lib/content';
import { formatDisplayOrder } from '@/lib/utils';

const ICON_OPTIONS = [
  { value: 'default', label: 'Default', icon: LinkIcon },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'mail', label: 'Mail', icon: Mail },
];

function getNextLinkOrder(links: LinkRecord[] | null) {
  if (!links || links.length === 0) {
    return 1;
  }

  return Math.max(1, Math.max(...links.map((link) => link.order)) + 1);
}

export function LinksManager() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [links, setLinks] = useState<LinkRecord[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('default');
  const [order, setOrder] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;
    setErrorMessage(null);

    getAdminLinks()
      .then((nextLinks) => {
        if (!cancelled) {
          setLinks(nextLinks);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof AdminApiError && error.status === 401) {
          router.replace('/login?next=/admin');
          router.refresh();
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Failed to load links.');
        setLinks([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isEditing || !links) {
      return;
    }

    setOrder(getNextLinkOrder(links));
  }, [isEditing, links]);

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setIcon('default');
    setEditId(null);
    setOrder(getNextLinkOrder(links));
    setIsEditing(false);
  };

  const handleEdit = (link: LinkRecord) => {
    setTitle(link.title);
    setUrl(link.url);
    setIcon(link.icon);
    setOrder(link.order);
    setEditId(link.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    setErrorMessage(null);

    try {
      await deleteAdminLink(id);
      setLinks((currentLinks) => currentLinks?.filter((link) => link.id !== id) ?? []);
    } catch (err: unknown) {
      if (err instanceof AdminApiError && err.status === 401) {
        router.replace('/login?next=/admin');
        router.refresh();
        return;
      }

      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete link.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);
    const linkData = {
      title,
      url,
      icon,
      order,
    };

    try {
      if (editId) {
        await updateAdminLink(editId, linkData);
      } else {
        await createAdminLink(linkData);
      }

      const nextLinks = await getAdminLinks();
      setLinks(nextLinks);
      resetForm();
    } catch (err: unknown) {
      if (err instanceof AdminApiError && err.status === 401) {
        router.replace('/login?next=/admin');
        router.refresh();
        return;
      }

      setErrorMessage(err instanceof Error ? err.message : 'Failed to save link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (links === null) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-100">Manage Links</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors text-sm font-medium"
          >
            <Plus size={16} className="mr-2" />
            Add Link
          </button>
        )}
      </div>

      {errorMessage ? <AdminNotice>{errorMessage}</AdminNotice> : null}

      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="link-title" className="block text-sm font-medium text-zinc-400 mb-1">
                Title
              </label>
              <input
                id="link-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200"
                required
              />
            </div>
            <div>
              <label htmlFor="link-url" className="block text-sm font-medium text-zinc-400 mb-1">
                URL
              </label>
              <input
                id="link-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200"
                required
              />
            </div>
            <div>
              <label htmlFor="link-icon" className="block text-sm font-medium text-zinc-400 mb-1">
                Icon
              </label>
              <select
                id="link-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="link-order" className="block text-sm font-medium text-zinc-400 mb-1">
                Order
              </label>
              <input
                id="link-order"
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors text-sm font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Save className="mr-2" size={16} />
              )}
              {editId ? 'Update Link' : 'Save Link'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium text-zinc-500 w-16">Order</th>
              <th className="px-6 py-4 font-medium text-zinc-500 w-16">Icon</th>
              <th className="px-6 py-4 font-medium text-zinc-500">Title</th>
              <th className="px-6 py-4 font-medium text-zinc-500">URL</th>
              <th className="px-6 py-4 font-medium text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {links.map((link) => {
              const IconComponent =
                ICON_OPTIONS.find((opt) => opt.value === link.icon)?.icon || LinkIcon;
              return (
                <tr key={link.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-zinc-500">{formatDisplayOrder(link.order)}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    <IconComponent size={18} />
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{link.title}</td>
                  <td className="px-6 py-4 text-zinc-500 truncate max-w-xs">{link.url}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(link)}
                        className="p-2 text-zinc-500 hover:text-blue-400 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <ConfirmDeleteButton
                        onDelete={() => handleDelete(link.id)}
                        title="Delete link"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {links.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No links found. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
