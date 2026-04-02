import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DinoGame } from '@/components/dino-game';

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] gap-10 px-4 py-12">
      <div className="grid gap-4 border-b border-[var(--border)] pb-10 text-center">
        <span className="nd-label text-[var(--text-secondary)]">Route Lost</span>
        <h1 className="font-display text-[clamp(4rem,14vw,8rem)] leading-[0.84] tracking-[-0.06em] text-[var(--text-display)]">
          404
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
          This page does not exist anymore, or the address was never valid.
        </p>
        <p className="mx-auto max-w-xl font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-disabled)]">
          [ FALLBACK ACTIVE ] [ DINO READY ]
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <DinoGame />
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm uppercase tracking-[0.12em] text-[var(--text-secondary)] hover:text-[var(--text-display)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
