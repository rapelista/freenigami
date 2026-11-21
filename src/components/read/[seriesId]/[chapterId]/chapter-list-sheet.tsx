'use client';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { LoaderCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { BottomSheet } from '~/components/ui/bottom-sheet';
import { isRecent, timeAgo } from '~/lib/format';
import { cn } from '~/lib/utils';
import { useReaderSettings } from '~/stores/reader';
import { trpc } from '~/trpc/client';

const PAGE_SIZE = 50;
const EMPTY: string[] = [];

interface ChapterListSheetProps {
  seriesId: string;
  chapterId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function releaseLabel(date: string) {
  if (isRecent(date, 30)) return `${timeAgo(date)} lalu`;

  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
    new Date(date),
  );
}

export function ChapterListSheet({
  seriesId,
  chapterId,
  isOpen,
  onOpenChange,
}: ChapterListSheetProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 400);

  const readIds = useReaderSettings(
    (state) => state.history[seriesId] ?? EMPTY,
  );

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetching } =
    useInfiniteQuery({
      ...trpc.chapter.listBySeriesId.infiniteQueryOptions(
        {
          seriesId,
          page_size: PAGE_SIZE,
          search: debouncedSearch,
          sort_order: 'desc',
        },
        {
          getNextPageParam: (lastPage) =>
            lastPage.meta.next_cursor ?? undefined,
          placeholderData: keepPreviousData,
        },
      ),
      enabled: isOpen,
    });

  const chapters = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta.total_record ?? null;

  // Load the next page when the end of the list scrolls into view.
  const sentinelRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) fetchNextPage();
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isFetching, fetchNextPage, chapters.length]);

  return (
    <BottomSheet
      aside={
        total !== null && (
          <span className="self-center font-mono text-xs text-muted">
            {total} chapter
          </span>
        )
      }
      closeLabel="Tutup daftar chapter"
      isOpen={isOpen}
      title="Daftar Chapter"
      onOpenChange={onOpenChange}
    >
      <div className="px-4 pb-3">
        <label className="relative block">
          <span className="sr-only">Cari chapter</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="h-10 w-full rounded-lg border border-border bg-(--field-background) pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent"
            inputMode="numeric"
            placeholder="Cari chapter..."
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-[max(env(safe-area-inset-bottom),12px)]">
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => (
            <li
              key={i}
              className="mx-2 my-1 h-11 animate-pulse rounded-lg bg-surface"
            />
          ))}

        {isError && chapters.length === 0 && (
          <li className="py-10 text-center text-sm text-muted">
            Gagal memuat chapter.
          </li>
        )}

        {!isLoading && !isError && chapters.length === 0 && (
          <li className="py-10 text-center text-sm text-muted">
            Chapter tidak ditemukan.
          </li>
        )}

        {chapters.map((chapter) => {
          const isCurrent = chapter.chapter_id === chapterId;
          const isRead = !isCurrent && readIds.includes(chapter.chapter_id);

          return (
            <li key={chapter.chapter_id}>
              <Link
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface',
                  isCurrent && 'bg-surface-secondary',
                  isRead && 'bg-amber-soft/60',
                )}
                href={`/read/${seriesId}/${chapter.chapter_id}`}
                onClick={() => onOpenChange(false)}
              >
                <span
                  className={cn(
                    'w-10 shrink-0 font-mono text-xs text-muted',
                    isCurrent && 'text-accent',
                  )}
                >
                  {chapter.chapter_number}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-sm',
                      isCurrent && 'font-semibold text-accent',
                    )}
                  >
                    Chapter {chapter.chapter_number}
                    {chapter.chapter_title && ` — ${chapter.chapter_title}`}
                  </span>
                  <span className="block text-xs text-muted">
                    {releaseLabel(chapter.release_date)}
                  </span>
                </span>
                {(isCurrent || isRead) && (
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                      isCurrent
                        ? 'bg-accent/20 text-accent'
                        : 'bg-surface-tertiary text-muted',
                    )}
                  >
                    {isCurrent ? 'Dibaca' : 'Sudah dibaca'}
                  </span>
                )}
              </Link>
            </li>
          );
        })}

        {hasNextPage && (
          <li ref={sentinelRef} className="flex justify-center py-3 text-muted">
            <LoaderCircle className="size-4 animate-spin" />
          </li>
        )}
      </ul>
    </BottomSheet>
  );
}
