'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ConfirmDeleteButtonProps = {
  onDelete: () => Promise<void>;
  title?: string;
};

export function ConfirmDeleteButton({ onDelete, title = 'Delete' }: ConfirmDeleteButtonProps) {
  const [status, setStatus] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    if (status === 'idle') {
      setStatus('confirm');

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setStatus((previousStatus) => (previousStatus === 'confirm' ? 'idle' : previousStatus));
        timeoutRef.current = null;
      }, 3000);

      return;
    }

    if (status !== 'confirm') {
      return;
    }

    setStatus('deleting');

    try {
      await onDelete();
    } finally {
      setStatus('idle');
    }
  };

  if (status === 'confirm') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 rounded border border-red-900/50 bg-red-950/30 px-2 py-1 text-red-300 transition-colors hover:bg-red-950/50"
        title="Click again to confirm"
      >
        <span className="text-xs font-bold">Confirm?</span>
        <Trash2 size={14} />
      </button>
    );
  }

  if (status === 'deleting') {
    return (
      <button
        type="button"
        disabled
        className="cursor-wait p-2 text-zinc-600"
        title={`${title} in progress`}
      >
        <Loader2 size={16} className="animate-spin" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-2 text-zinc-500 transition-colors hover:text-red-500 dark:hover:text-red-400"
      title={title}
    >
      <Trash2 size={16} />
    </button>
  );
}
