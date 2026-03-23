'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

import { authClient } from '~/lib/auth/client';
import { BookmarkType } from '~/lib/enum';
import { useBookmarkStore } from '~/stores/bookmark';
import { trpc } from '~/trpc/client';

export function BookmarkSyncButton() {
  const { data: session } = authClient.useSession();
  const isNonAnonymous = session?.user && !session.user.isAnonymous;

  const queryClient = useQueryClient();
  const syncMutation = useMutation(trpc.bookmark.syncFromLocal.mutationOptions());

  if (!isNonAnonymous) return null;

  const handleSync = () => {
    const { bookmarks, setSyncedUserId } = useBookmarkStore.getState();

    const series = bookmarks
      .filter((b) => b.type === BookmarkType.SERIES)
      .map((b) => b.value as string);

    const chapters = bookmarks
      .filter((b) => b.type === BookmarkType.CHAPTERS)
      .map((b) => b.value as { seriesId: string; chapterId: string });

    syncMutation.mutate(
      { series, chapters },
      {
        onSuccess: () => {
          setSyncedUserId(session.user.id);
          queryClient.invalidateQueries({
            queryKey: trpc.bookmark.list.queryOptions().queryKey,
          });
        },
      },
    );
  };

  return (
    <button
      className="group flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={syncMutation.isPending}
      onClick={handleSync}
      title="Sync bookmark ke database"
    >
      <RefreshCw
        className={`w-4 h-4 shrink-0 ${syncMutation.isPending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`}
      />
      <span className="max-md:hidden">
        {syncMutation.isPending ? 'Syncing...' : 'Sync'}
      </span>
    </button>
  );
}
