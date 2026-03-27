import { Github, Globe, Linkedin, Link as LinkIcon, Mail, Twitter } from 'lucide-react';
import type { LinkRecord } from '@/lib/content';

const iconMap = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  website: Globe,
  mail: Mail,
  default: LinkIcon,
} as const;

export function PublicLinks({ links }: { links: LinkRecord[] }) {
  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-center text-zinc-900 dark:text-zinc-100 font-display">
        Connect
      </h1>

      <div className="grid gap-4">
        {links.length === 0 ? (
          <p className="text-center text-zinc-500">No links added yet.</p>
        ) : (
          links.map((link) => {
            const Icon =
              iconMap[link.icon.toLowerCase() as keyof typeof iconMap] || iconMap.default;

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group"
              >
                <span className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 mr-4">
                  <Icon size={20} />
                </span>
                <span className="font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                  {link.title}
                </span>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
