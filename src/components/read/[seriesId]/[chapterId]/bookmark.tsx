'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkIcon } from 'lucide-react';

import { authClient } from '~/lib/auth/client';
import { BookmarkType } from '~/lib/enum';
import { checkIsBookmarked, cn } from '~/lib/utils';
import { useBookmarkStore, type Bookmark } from '~/stores/bookmark';
import { trpc } from '~/trpc/client';

interface ChapterBookmarkProps {
  chapterId: string;
  seriesId: string;
}

export function ChapterBookmark({ chapterId, seriesId }: ChapterBookmarkProps) {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const { data: session } = authClient.useSession();
  const isNonAnonymous = session?.user && !session.user.isAnonymous;

  const bookmark: Bookmark = {
    type: BookmarkType.CHAPTERS,
    value: { chapterId, seriesId },
  };

  const isBookmarked = checkIsBookmarked(bookmarks, bookmark);

  const queryClient = useQueryClient();
  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.bookmark.list.queryOptions().queryKey,
    });

  const addChapter = useMutation({
    ...trpc.bookmark.addChapter.mutationOptions(),
    onSuccess: invalidateList,
  });
  const removeChapter = useMutation({
    ...trpc.bookmark.removeChapter.mutationOptions(),
    onSuccess: invalidateList,
  });

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(bookmark);
      if (isNonAnonymous) removeChapter.mutate({ chapterId });
    } else {
      addBookmark(bookmark);
      if (isNonAnonymous) addChapter.mutate({ seriesId, chapterId });
    }
  };

  return (
    <button onClick={handleToggleBookmark}>
      <BookmarkIcon
        className={cn(isBookmarked ? 'fill-current' : 'fill-none')}
      />
    </button>
  );
}
