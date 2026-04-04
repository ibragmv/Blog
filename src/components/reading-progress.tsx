'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';

type ReadingProgressVariant = 'aside' | 'header' | 'meter';

let activeSelector = '#article-content';
let currentProgress = 0;
let frameId = 0;
let stopListening: (() => void) | null = null;

const listeners = new Set<() => void>();

function emit(nextProgress: number) {
  if (nextProgress === currentProgress) {
    return;
  }

  currentProgress = nextProgress;

  for (const listener of listeners) {
    listener();
  }
}

function calculateReadingProgress() {
  const contentElement = document.querySelector<HTMLElement>(activeSelector);

  if (!contentElement) {
    return 0;
  }

  const rect = contentElement.getBoundingClientRect();
  const contentTop = window.scrollY + rect.top;
  const contentBottom = contentTop + contentElement.offsetHeight;
  const viewportOffset = window.innerHeight * 0.3;
  const startScroll = contentTop - viewportOffset;
  const endScroll = Math.max(contentBottom - window.innerHeight, startScroll + 1);
  const rawProgress = ((window.scrollY - startScroll) / (endScroll - startScroll)) * 100;

  return Number(Math.min(100, Math.max(0, rawProgress)).toFixed(2));
}

function updateReadingProgress() {
  emit(calculateReadingProgress());
}

function scheduleReadingProgress() {
  if (frameId !== 0) {
    return;
  }

  frameId = window.requestAnimationFrame(() => {
    frameId = 0;
    updateReadingProgress();
  });
}

function ensureListeners() {
  if (stopListening) {
    return;
  }

  scheduleReadingProgress();
  window.addEventListener('scroll', scheduleReadingProgress, { passive: true });
  window.addEventListener('resize', scheduleReadingProgress);

  stopListening = () => {
    if (frameId !== 0) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }

    window.removeEventListener('scroll', scheduleReadingProgress);
    window.removeEventListener('resize', scheduleReadingProgress);
    stopListening = null;
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureListeners();
  scheduleReadingProgress();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      stopListening?.();
    }
  };
}

function getSnapshot() {
  return currentProgress;
}

function getServerSnapshot() {
  return 0;
}

function useReadingProgress(selector: string) {
  useEffect(() => {
    activeSelector = selector;
    scheduleReadingProgress();
  }, [selector]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ReadingProgress({
  selector,
  variant,
}: {
  selector: string;
  variant: ReadingProgressVariant;
}) {
  const readingProgress = useReadingProgress(selector);

  if (variant === 'aside') {
    return (
      <span className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
        [{Math.round(readingProgress)}% Read]
      </span>
    );
  }

  if (variant === 'meter') {
    const progressSegments = Array.from({ length: 16 }, (_, index) => {
      const threshold = ((index + 1) / 16) * 100;
      return readingProgress >= threshold;
    });

    return (
      <div
        className="grid grid-cols-8 gap-1 md:grid-cols-16"
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      >
        {progressSegments.map((isActive, index) => (
          <span
            key={String(index)}
            className="h-2.5 w-full"
            style={{
              backgroundColor: isActive ? 'var(--text-display)' : 'var(--border)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="sticky top-[var(--header-height)] z-30 grid gap-4 border-y border-[var(--border)] bg-[var(--black)] py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/archive"
          className="inline-flex min-h-11 items-center gap-2 text-base font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)] hover:text-[var(--text-display)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to archive
        </Link>
        <span className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
          [{Math.round(readingProgress)}% Read]
        </span>
      </div>
      <ReadingProgress selector={selector} variant="meter" />
    </div>
  );
}
