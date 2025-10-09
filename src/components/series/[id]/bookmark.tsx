'use client';

import { Button } from '@heroui/react';
import { BookmarkCheck, BookmarkPlus } from 'lucide-react';
import { useParams } from 'next/navigation';

import { useAppStore } from '~/stores/app';

export function SeriesBookmark() {
  const { id } = useParams<{ id: string }>();

  const { bookmarks, bookmarkSeries, removeSeries } = useAppStore();

  const isBookmarked = bookmarks.series.some((series) => series.id === id);

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeSeries(id);
    } else {
      bookmarkSeries({ id });
    }
  };

  return (
    <Button onPress={handleToggleBookmark}>
      {isBookmarked ? <BookmarkCheck /> : <BookmarkPlus />}
      Bookmark
    </Button>
  );
}
