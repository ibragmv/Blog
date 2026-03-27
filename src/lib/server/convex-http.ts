import { getConvexUrl } from '@/lib/server/convex';

export type NextFetchOptions = {
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

type ConvexQuerySuccess<T> = {
  status: 'success';
  value: T;
};

type ConvexQueryError = {
  status: 'error';
  errorMessage?: string;
};

export async function queryConvex<T>(
  path: string,
  args: Record<string, unknown> = {},
  options: NextFetchOptions = { cache: 'no-store' }
) {
  const response = await fetch(`${getConvexUrl()}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Convex-Client': 'blog-serverless',
    },
    ...options,
    body: JSON.stringify({
      path,
      format: 'convex_encoded_json',
      args: [args],
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as ConvexQuerySuccess<T> | ConvexQueryError;

  if (payload.status === 'error') {
    throw new Error(payload.errorMessage || `Convex query failed for ${path}.`);
  }

  return payload.value;
}
