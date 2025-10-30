'use client';

import { Button } from '@heroui/react';
import { BookmarkCheck, BookmarkPlus } from 'lucide-react';

import { BookmarkType } from '~/lib/enum';
import { checkIsBookmarked } from '~/lib/utils';
import { useBookmarkStore, type Bookmark } from '~/stores/bookmark';

interface SeriesBookmarkProps {
  seriesId: string;
}

export function SeriesBookmark({ seriesId }: SeriesBookmarkProps) {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const bookmark: Bookmark = { type: BookmarkType.SERIES, value: seriesId };
  const isBookmarked = checkIsBookmarked(bookmarks, bookmark);

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(bookmark);
    } else {
      addBookmark(bookmark);
    }
  };

  return (
    <Button onPress={handleToggleBookmark}>
      {isBookmarked ? <BookmarkCheck /> : <BookmarkPlus />}
      Bookmark
    </Button>
  );
}
