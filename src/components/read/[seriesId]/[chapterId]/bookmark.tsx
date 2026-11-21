'use client';

import { BookmarkIcon } from 'lucide-react';

import { BookmarkType } from '~/lib/enum';
import { checkIsBookmarked, cn } from '~/lib/utils';
import { useBookmarkStore, type Bookmark } from '~/stores/bookmark';

interface ChapterBookmarkProps {
  chapterId: string;
  seriesId: string;
  className?: string;
  showLabel?: boolean;
}

export function ChapterBookmark({
  chapterId,
  seriesId,
  className,
  showLabel = true,
}: ChapterBookmarkProps) {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const bookmark: Bookmark = {
    type: BookmarkType.CHAPTERS,
    value: { chapterId, seriesId },
  };

  const isBookmarked = checkIsBookmarked(bookmarks, bookmark);

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(bookmark);
    } else {
      addBookmark(bookmark);
    }
  };

  return (
    <button
      aria-label={isBookmarked ? 'Hapus bookmark chapter' : 'Bookmark chapter'}
      aria-pressed={isBookmarked}
      className={cn(
        'flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors',
        isBookmarked
          ? 'bg-accent/15 text-accent'
          : 'bg-amber-soft/70 hover:bg-amber-soft',
        className,
      )}
      type="button"
      onClick={handleToggleBookmark}
    >
      <BookmarkIcon
        className={cn('size-4', isBookmarked ? 'fill-current' : 'fill-none')}
      />
      {showLabel && <span className="max-sm:hidden">Bookmark</span>}
    </button>
  );
}
