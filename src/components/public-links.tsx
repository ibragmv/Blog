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
    <div className="grid gap-10 animate-in fade-in duration-500 md:gap-14">
      <section className="grid gap-8 border-b border-[var(--border)] pb-10 md:gap-10 md:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
        <div className="grid gap-5">
          <span className="nd-label text-[var(--text-secondary)]">External Presence</span>
          <div className="grid gap-5">
            <h1 className="text-balance font-display text-[clamp(2.9rem,14vw,7.5rem)] leading-[0.88] tracking-[-0.04em] text-[var(--text-display)] md:leading-[0.84] md:tracking-[-0.06em]">
              LINKS
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7 md:text-lg">
              A compact directory of platforms, profiles, and direct contact endpoints.
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[var(--border)] pt-5">
          <div className="flex items-end justify-between gap-4">
            <span className="nd-label text-[var(--text-secondary)]">Channels</span>
            <span className="font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.05em] text-[var(--text-display)]">
              {links.length}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-[var(--border)] pt-3">
            <span className="nd-label text-[var(--text-disabled)]">State</span>
            <span className="text-base font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
              [ Public ]
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {links.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center border-y border-[var(--border)] px-6 py-12 text-center">
            <p className="max-w-sm text-base uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              [ No external channels configured ]
            </p>
          </div>
        ) : (
          links.map((link, index) => {
            const Icon =
              iconMap[link.icon.toLowerCase() as keyof typeof iconMap] || iconMap.default;

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-4 border-b border-[var(--border)] py-5 md:grid-cols-[5rem_minmax(0,1fr)_6.5rem] md:items-center md:gap-8"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] group-hover:text-[var(--text-display)]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="grid min-w-0 gap-1">
                  <span className="text-xl tracking-[-0.03em] text-[var(--text-display)] transition-colors group-hover:text-[var(--interactive)] md:text-[1.7rem]">
                    {link.title}
                  </span>
                  <span className="break-all text-sm font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {link.url.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span className="nd-label text-[var(--text-disabled)]">
                    {index.toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
                    [ Open ]
                  </span>
                </div>
              </a>
            );
          })
        )}
      </section>
    </div>
  );
}
