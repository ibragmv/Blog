'use client';

import { useEffect, useState } from 'react';
import { DinoGame } from '@/components/dino-game';

export function DinoGameShell() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full rounded-[28px] border border-[var(--border)] px-4 py-12 text-center text-sm text-[var(--text-secondary)]">
        Loading dino simulation...
      </div>
    );
  }

  return <DinoGame />;
}
