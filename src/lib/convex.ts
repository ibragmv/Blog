import { ConvexReactClient } from 'convex/react';

let client: ConvexReactClient | null = null;
let clientUrl: string | null = null;

export function getConvexClient(explicitUrl?: string) {
  const convexUrl = explicitUrl || process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      'Missing client Convex URL. Set NEXT_PUBLIC_CONVEX_URL or pass the URL explicitly.'
    );
  }

  if (client && clientUrl === convexUrl) {
    return client;
  }

  client = new ConvexReactClient(convexUrl);
  clientUrl = convexUrl;
  return client;
}
