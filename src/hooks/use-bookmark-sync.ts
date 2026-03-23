'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { authClient } from '~/lib/auth/client';
import { BookmarkType } from '~/lib/enum';
import { useBookmarkStore } from '~/stores/bookmark';
import { trpc } from '~/trpc/client';

export function useBookmarkSync() {
  const { data: session } = authClient.useSession();
  const isNonAnonymous = !!(session?.user && !session.user.isAnonymous);

  const listQuery = useQuery({
    ...trpc.bookmark.list.queryOptions(),
    enabled: isNonAnonymous,
  });

  const syncMutation = useMutation(
    trpc.bookmark.syncFromLocal.mutationOptions(),
  );

  useEffect(() => {
    const userId = session?.user?.id;

    if (!isNonAnonymous || !userId) return;
    if (listQuery.isPending || !listQuery.data) return;

    const dbSeries = listQuery.data.series;
    const dbChapters = listQuery.data.chapters;

    const doSync = () => {
      const { bookmarks, syncedUserId, setSyncedUserId, addBookmark } =
        useBookmarkStore.getState();

      if (syncedUserId === userId) return;

      // Merge: tambahkan bookmark dari DB yang belum ada di lokal
      for (const { seriesId } of dbSeries) {
        const exists = bookmarks.some(
          (b) => b.type === BookmarkType.SERIES && b.value === seriesId,
        );

        if (!exists)
          addBookmark({ type: BookmarkType.SERIES, value: seriesId });
      }

      for (const { seriesId, chapterId } of dbChapters) {
        const exists = bookmarks.some(
          (b) =>
            b.type === BookmarkType.CHAPTERS &&
            b.value.seriesId === seriesId &&
            b.value.chapterId === chapterId,
        );

        if (!exists)
          addBookmark({
            type: BookmarkType.CHAPTERS,
            value: { seriesId, chapterId },
          });
      }

      // Sync merged state → DB (upload bookmark lokal yang belum ada di DB)
      const merged = useBookmarkStore.getState().bookmarks;

      const series = merged
        .filter((b) => b.type === BookmarkType.SERIES)
        .map((b) => b.value as string);

      const chapters = merged
        .filter((b) => b.type === BookmarkType.CHAPTERS)
        .map((b) => b.value as { seriesId: string; chapterId: string });

      syncMutation.mutate(
        { series, chapters },
        { onSuccess: () => setSyncedUserId(userId) },
      );
    };

    if (useBookmarkStore.persist.hasHydrated()) {
      doSync();
    } else {
      return useBookmarkStore.persist.onFinishHydration(doSync);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, session?.user?.isAnonymous, listQuery.data]);
}
