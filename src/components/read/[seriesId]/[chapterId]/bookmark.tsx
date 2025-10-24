import { Button } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck, BookmarkPlus, Loader2 } from 'lucide-react';

import { useAppStore } from '~/stores/app';
import { trpc } from '~/trpc/client';

interface ChapterBookmarkProps {
  chapterId: string;
}

export function ChapterBookmark({ chapterId }: ChapterBookmarkProps) {
  const { data, isLoading } = useQuery(
    trpc.chapter.byId.queryOptions({ id: chapterId }),
  );

  const { bookmarks, bookmarkChapter, removeChapter } = useAppStore();

  const isBookmarked = bookmarks.chapters.some(
    (chapter) => chapter.id === chapterId,
  );

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeChapter(chapterId);
    } else {
      if (data?.data) {
        const seriesId = data.data.manga_id;

        bookmarkChapter({ id: chapterId, seriesId });
      }
    }
  };

  return (
    <Button
      isDisabled={isLoading || !data}
      size="sm"
      variant="secondary"
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
