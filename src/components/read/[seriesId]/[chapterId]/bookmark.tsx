import { BookmarkIcon } from 'lucide-react';

import { BookmarkType } from '~/lib/enum';
import { checkIsBookmarked, cn } from '~/lib/utils';
import { useBookmarkStore, type Bookmark } from '~/stores/bookmark';

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

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(bookmark);
    } else {
      addBookmark(bookmark);
    }
  };

  return (
    <button onClick={handleToggleBookmark}>
      <BookmarkIcon
        className={cn(isBookmarked ? 'fill-current' : 'fill-none')}
      />
    </button>
    // <Button
    //   className="w-full justify-start"
    //   isDisabled={isLoading || !data}
    //   size="sm"
    //   variant="tertiary"
    //   onPress={handleToggleBookmark}
    // >
    //   {isLoading ? (
    //     <Loader2 className="animate-spin" />
    //   ) : isBookmarked ? (
    //     <BookmarkCheck />
    //   ) : (
    //     <BookmarkPlus />
    //   )}
    //   Bookmark
    // </Button>
  );
}
