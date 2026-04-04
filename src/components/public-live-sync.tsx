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
  const initialSnapshotRef = useRef(serializeSnapshot(initialValue));
  const refreshPendingRef = useRef(false);

  useEffect(() => {
    const nextInitialSnapshot = serializeSnapshot(initialValue);
    initialSnapshotRef.current = nextInitialSnapshot;

    if (serializeSnapshot(currentValue) === nextInitialSnapshot) {
      refreshPendingRef.current = false;
    }
  }, [currentValue, initialValue]);

  useEffect(() => {
    if (currentValue === undefined) {
      return;
    }

    const currentSnapshot = serializeSnapshot(currentValue);

    if (currentSnapshot === initialSnapshotRef.current || refreshPendingRef.current) {
      return;
    }

    refreshPendingRef.current = true;

    startTransition(() => {
      router.refresh();
    });
  }, [currentValue, router]);
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
