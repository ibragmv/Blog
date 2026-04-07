'use client';

import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useRef } from 'react';
import type { LinkRecord, PostRecord } from '@/lib/content';

function serializeSnapshot(value: unknown) {
  return JSON.stringify(value ?? null);
}

function useRefreshOnChange(currentValue: unknown, initialValue: unknown) {
  const router = useRouter();
  const initialSnapshot = serializeSnapshot(initialValue);
  const lastInitialSnapshotRef = useRef(initialSnapshot);
  const refreshPendingRef = useRef(false);

  if (lastInitialSnapshotRef.current !== initialSnapshot) {
    lastInitialSnapshotRef.current = initialSnapshot;
    refreshPendingRef.current = false;
  }

  useEffect(() => {
    if (currentValue === undefined) {
      return;
    }

    const currentSnapshot = serializeSnapshot(currentValue);

    if (currentSnapshot === initialSnapshot) {
      refreshPendingRef.current = false;
      return;
    }

    if (refreshPendingRef.current) {
      return;
    }

    refreshPendingRef.current = true;

    startTransition(() => {
      router.refresh();
    });
  }, [currentValue, initialSnapshot, router]);
}

export function HomeLiveSync({ initialPost }: { initialPost: PostRecord | null }) {
  const currentPostResult = useQuery(api.posts.getHomePage, {});
  const currentPost = currentPostResult?.published ? currentPostResult : null;
  useRefreshOnChange(currentPost, initialPost);
  return null;
}

export function ArchiveListLiveSync({ initialPosts }: { initialPosts: PostRecord[] }) {
  const currentPosts = useQuery(api.posts.listPublished, {});
  useRefreshOnChange(currentPosts, initialPosts);
  return null;
}

export function ArchivePostLiveSync({
  initialPost,
  slug,
}: {
  initialPost: PostRecord | null;
  slug: string;
}) {
  const currentPost = useQuery(api.posts.getPublishedBySlug, { slug });
  useRefreshOnChange(currentPost, initialPost);
  return null;
}

export function LinksLiveSync({ initialLinks }: { initialLinks: LinkRecord[] }) {
  const currentLinks = useQuery(api.links.listPublic, {});
  useRefreshOnChange(currentLinks, initialLinks);
  return null;
}
