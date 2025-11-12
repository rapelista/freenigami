import { Button } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck, BookmarkPlus, Loader2 } from 'lucide-react';

import { BookmarkType } from '~/lib/enum';
import { checkIsBookmarked } from '~/lib/utils';
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

  const bookmark: Bookmark = {
    type: BookmarkType.CHAPTERS,
    value: { chapterId, seriesId },
  };

  const isBookmarked = checkIsBookmarked(bookmarks, bookmark);

  const { data, isLoading } = useQuery(
    trpc.chapter.byId.queryOptions({ id: chapterId }),
  );

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(bookmark);
    } else {
      addBookmark(bookmark);
    }
  };

  return (
    <Button
      className="w-full justify-start"
      isDisabled={isLoading || !data}
      size="sm"
      variant="tertiary"
      onPress={handleToggleBookmark}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck />
      ) : (
        <BookmarkPlus />
      )}
      Bookmark
    </Button>
  );
}
