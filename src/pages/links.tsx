import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import { Github, Globe, Linkedin, Link as LinkIcon, Mail, Twitter } from 'lucide-react';
import type React from 'react';
import { PageLoader } from '@/components/page-loader';

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={20} />,
  twitter: <Twitter size={20} />,
  linkedin: <Linkedin size={20} />,
  website: <Globe size={20} />,
  mail: <Mail size={20} />,
  default: <LinkIcon size={20} />,
};

export default function Links() {
  const links = useQuery(api.links.listPublic, {});

  if (links === undefined) {
    return <PageLoader className="h-64" />;
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
