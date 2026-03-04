import { Github, Globe, Linkedin, Link as LinkIcon, Loader2, Mail, Twitter } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { type Link as LinkType, supabase } from '@/lib/supabase';

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={20} />,
  twitter: <Twitter size={20} />,
  linkedin: <Linkedin size={20} />,
  website: <Globe size={20} />,
  mail: <Mail size={20} />,
  default: <LinkIcon size={20} />,
};

export default function Links() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const { data, error } = await supabase
          .from('links')
          .select('*')
          .order('order', { ascending: true });

        if (error) throw error;
        setLinks(data || []);
      } catch (err) {
        console.error('Error fetching links:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-center text-zinc-900 dark:text-zinc-100 font-display">
        Connect
      </h1>

      <div className="grid gap-4">
        {links.length === 0 ? (
          <p className="text-center text-zinc-500">No links added yet.</p>
        ) : (
          links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group"
            >
              <span className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 mr-4">
                {iconMap[link.icon.toLowerCase()] || iconMap.default}
              </span>
              <span className="font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                {link.title}
              </span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
