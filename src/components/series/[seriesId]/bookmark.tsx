'use client';

import { Button } from '@heroui/react';
import { BookmarkCheck, BookmarkPlus } from 'lucide-react';

import { useAppStore } from '~/stores/app';

interface SeriesBookmarkProps {
  seriesId: string;
}

export function SeriesBookmark({ seriesId }: SeriesBookmarkProps) {
  const { bookmarks, bookmarkSeries, removeSeries } = useAppStore();

  const isBookmarked = bookmarks.series.some(
    (series) => series.id === seriesId,
  );

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeSeries(seriesId);
    } else {
      bookmarkSeries({ id: seriesId });
    }
  };

  return (
    <Button onPress={handleToggleBookmark}>
      {isBookmarked ? <BookmarkCheck /> : <BookmarkPlus />}
      Bookmark
    </Button>
  );
}
