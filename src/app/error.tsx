'use client';

import { useEffect } from 'react';

export default function RouteErrorBoundary({
  // Next.js requires this filename for route segment error boundaries.
  // The function name itself does not need to shadow the global Error type.
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-3xl font-display font-semibold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
        The page failed to load. Try the request again or navigate back to the homepage.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
      >
        Retry
      </button>
    </div>
  );
}
