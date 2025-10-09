import { Button } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck, BookmarkPlus } from 'lucide-react';
import { useParams } from 'next/navigation';

import { useAppStore } from '~/stores/app';
import { trpc } from '~/trpc/client';

export function ChapterBookmark() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery(trpc.chapter.byId.queryOptions({ id }));

  const { bookmarks, bookmarkChapter, removeChapter } = useAppStore();

  const isBookmarked = bookmarks.chapters.some((series) => series.id === id);

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeChapter(id);
    } else {
      if (data?.data) {
        const seriesId = data.data.manga_id;

        bookmarkChapter({ id, seriesId });
      }
    }
  };

  return (
    <Button size="sm" variant="tertiary" onPress={handleToggleBookmark}>
      {isBookmarked ? <BookmarkCheck /> : <BookmarkPlus />}
      Bookmark
    </Button>
  );
}
