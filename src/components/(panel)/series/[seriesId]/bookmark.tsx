'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkIcon } from 'lucide-react';

import { authClient } from '~/lib/auth/client';
import { BookmarkType } from '~/lib/enum';
import { checkIsBookmarked, cn } from '~/lib/utils';
import { useBookmarkStore, type Bookmark } from '~/stores/bookmark';
import { trpc } from '~/trpc/client';

interface SeriesBookmarkProps {
  seriesId: string;
}

export function SeriesBookmark({ seriesId }: SeriesBookmarkProps) {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const { data: session } = authClient.useSession();
  const isNonAnonymous = session?.user && !session.user.isAnonymous;

  const bookmark: Bookmark = { type: BookmarkType.SERIES, value: seriesId };
  const isBookmarked = checkIsBookmarked(bookmarks, bookmark);

  const queryClient = useQueryClient();
  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.bookmark.list.queryOptions().queryKey,
    });

  const addSeries = useMutation({
    ...trpc.bookmark.addSeries.mutationOptions(),
    onSuccess: invalidateList,
  });
  const removeSeries = useMutation({
    ...trpc.bookmark.removeSeries.mutationOptions(),
    onSuccess: invalidateList,
  });

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(bookmark);
      if (isNonAnonymous) removeSeries.mutate({ seriesId });
    } else {
      addBookmark(bookmark);
      if (isNonAnonymous) addSeries.mutate({ seriesId });
    }
  };

  return (
    <button
      aria-pressed={isBookmarked}
      className={cn(
        'flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors',
        isBookmarked
          ? 'bg-accent/15 text-accent ring-1 ring-accent/40'
          : 'bg-amber-soft hover:bg-amber-soft/70',
      )}
      type="button"
      onClick={handleToggleBookmark}
    >
      <BookmarkIcon className={cn('size-4', isBookmarked && 'fill-current')} />
      {isBookmarked ? 'Tersimpan' : 'Bookmark'}
    </button>
  );
}
