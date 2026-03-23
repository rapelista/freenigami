'use client';

import { useQuery } from '@tanstack/react-query';

import { authClient } from '~/lib/auth/client';
import { BookmarkType } from '~/lib/enum';
import { useBookmarkStore, type Bookmark } from '~/stores/bookmark';
import { trpc } from '~/trpc/client';

export function useBookmarks() {
  const { data: session } = authClient.useSession();
  const isNonAnonymous = !!(session?.user && !session.user.isAnonymous);

  const localBookmarks = useBookmarkStore((s) => s.bookmarks);

  const listQuery = useQuery({
    ...trpc.bookmark.list.queryOptions(),
    enabled: isNonAnonymous,
  });

  if (!isNonAnonymous) {
    return { bookmarks: localBookmarks, isPending: false };
  }

  if (listQuery.isPending) {
    return { bookmarks: [] as Bookmark[], isPending: true };
  }

  const dbBookmarks: Bookmark[] = [
    ...(listQuery.data?.series.map((s) => ({
      type: BookmarkType.SERIES as const,
      value: s.seriesId,
    })) ?? []),
    ...(listQuery.data?.chapters.map((c) => ({
      type: BookmarkType.CHAPTERS as const,
      value: { seriesId: c.seriesId, chapterId: c.chapterId },
    })) ?? []),
  ];

  return { bookmarks: dbBookmarks, isPending: false };
}
