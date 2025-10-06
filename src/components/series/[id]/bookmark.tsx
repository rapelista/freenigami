'use client';

import { Button } from '@heroui/react';
import { BookmarkCheck, BookmarkPlus } from 'lucide-react';
import { useParams } from 'next/navigation';

import { useAppStore } from '~/stores/app';

export function SeriesBookmark() {
  const { id } = useParams<{ id: string }>();

  const { bookmarks, addBookmark, removeBookmark } = useAppStore();

  const isBookmarked = bookmarks.includes(id);

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(id);
    } else {
      addBookmark(id);
    }
  };

  return (
    <Button onPress={handleToggleBookmark}>
      {isBookmarked ? <BookmarkCheck /> : <BookmarkPlus />}
      Bookmark
    </Button>
  );
}
