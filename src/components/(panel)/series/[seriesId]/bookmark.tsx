'use client';

import { Checkbox, Description, Label } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkIcon } from 'lucide-react';

import { BookmarkType } from '~/lib/enum';
import { checkIsBookmarked, cn } from '~/lib/utils';
import { useBookmarkStore, type Bookmark } from '~/stores/bookmark';
import { trpc } from '~/trpc/client';

interface SeriesBookmarkProps {
  seriesId: string;
}

export function SeriesBookmark({ seriesId }: SeriesBookmarkProps) {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const bookmark: Bookmark = { type: BookmarkType.SERIES, value: seriesId };
  const isBookmarked = checkIsBookmarked(bookmarks, bookmark);

  const { mutate } = useMutation(trpc.bookmark.series.mutationOptions());
  const queryClient = useQueryClient();

  const handleToggleBookmark = async () => {
    const series = await queryClient.ensureQueryData(
      trpc.series.detail.queryOptions({ id: seriesId }),
    );

    const { title, cover_image_url, cover_portrait_url } = series;

    mutate({
      id: seriesId,
      title: title,
      thumbnailUrl: cover_portrait_url || cover_image_url || '#',
    });

    if (isBookmarked) {
      removeBookmark(bookmark);
    } else {
      addBookmark(bookmark);
    }
  };

  return (
    <>
      <Checkbox
        isOnSurface
        className={cn(
          'bg-surface group relative flex-col gap-4 rounded-3xl px-5 py-4 transition-all',
          'data-[selected=true]:bg-accent/10',
        )}
        isSelected={isBookmarked}
        onChange={handleToggleBookmark}
      >
        <Checkbox.Control className="absolute right-4 top-3 size-5 rounded-full before:rounded-full">
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content className="flex flex-row items-start justify-start gap-4">
          <BookmarkIcon />
          <div className="flex flex-col gap-1">
            <Label>Bookmark Series</Label>
            <Description>
              Simpan series ini ke daftar bookmark kamu untuk akses cepat
            </Description>
          </div>
        </Checkbox.Content>
      </Checkbox>
    </>
  );
}
