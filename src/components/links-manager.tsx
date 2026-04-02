'use client';

import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
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
  Trash2,
  Twitter,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/admin-auth-provider';
import type { LinkRecord } from '@/lib/content';

const ICON_OPTIONS = [
  { value: 'default', label: 'Default', icon: LinkIcon },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'mail', label: 'Mail', icon: Mail },
];

export function LinksManager() {
  const { sessionToken } = useAdminAuth();
  const links = useQuery(api.links.listAdmin, sessionToken ? { sessionToken } : 'skip');
  const saveLink = useMutation(api.links.save);
  const removeLink = useMutation(api.links.remove);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('default');
  const [order, setOrder] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing || !links) {
      return;
    }

    if (links.length > 0) {
      const maxOrder = Math.max(...links.map((link) => link.order));
      setOrder(maxOrder + 1);
      return;
    }

    setOrder(0);
  }, [isEditing, links]);

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setIcon('default');
    setEditId(null);
    // Recalculate next order
    if (links && links.length > 0) {
      const maxOrder = Math.max(...links.map((link) => link.order));
      setOrder(maxOrder + 1);
    } else {
      setOrder(0);
    }
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
    if (!window.confirm('Delete this link?') || !sessionToken) return;
    try {
      await removeLink({
        sessionToken,
        linkId: id as Id<'links'>,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete link';
      alert(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) {
      return;
    }

    setIsSubmitting(true);

    const linkData = {
      sessionToken,
      ...(editId ? { linkId: editId as Id<'links'> } : {}),
      title,
      url,
      icon,
      order,
    };

    try {
      await saveLink(linkData);
      resetForm();
    } catch (err: unknown) {
      console.error('Error saving link:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error saving link: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (links === undefined) {
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
                value={order}
                onChange={(e) => setOrder(Number.parseInt(e.target.value, 10) || 0)}
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
                  <td className="px-6 py-4 text-zinc-500">{link.order}</td>
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
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
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
