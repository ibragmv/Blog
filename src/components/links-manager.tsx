import React, { useEffect, useState } from 'react';
import { supabase, type Link } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Save, X, Github, Twitter, Linkedin, Globe, Mail, Link as LinkIcon } from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'default', label: 'Default', icon: LinkIcon },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'mail', label: 'Mail', icon: Mail },
];

export function LinksManager() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('default');
  const [order, setOrder] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
      // Set next order automatically
      if (data && data.length > 0) {
        const maxOrder = Math.max(...data.map(l => l.order));
        setOrder(maxOrder + 1);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setIcon('default');
    setEditId(null);
    // Recalculate next order
    if (links.length > 0) {
      const maxOrder = Math.max(...links.map(l => l.order));
      setOrder(maxOrder + 1);
    } else {
      setOrder(0);
    }
    setIsEditing(false);
  };

  const handleEdit = (link: Link) => {
    setTitle(link.title);
    setUrl(link.url);
    setIcon(link.icon);
    setOrder(link.order);
    setEditId(link.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
      setLinks(links.filter(l => l.id !== id));
    } catch (err) {
      console.error('Error deleting link:', err);
      alert('Failed to delete link');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const linkData = {
      title,
      url,
      icon,
      order,
    };

    try {
      if (editId) {
        const { error } = await supabase
          .from('links')
          .update(linkData)
          .eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('links')
          .insert([linkData]);
        if (error) throw error;
      }
      await fetchLinks();
      resetForm();
    } catch (err: any) {
      console.error('Error saving link:', err);
      alert(`Error saving link: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && links.length === 0) {
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
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors text-sm font-medium"
          >
            <Plus size={16} className="mr-2" />
            Add Link
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Icon</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value))}
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
              disabled={loading}
              className="flex items-center px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors text-sm font-medium"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
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
              const IconComponent = ICON_OPTIONS.find(opt => opt.value === link.icon)?.icon || LinkIcon;
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
                        onClick={() => handleEdit(link)}
                        className="p-2 text-zinc-500 hover:text-blue-400 transition-colors"
                      >
                        <Save size={16} className="rotate-0" /> {/* Reusing Save icon as Edit for now, or import Edit2 */}
                      </button>
                      <button
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
            {links.length === 0 && !loading && (
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
