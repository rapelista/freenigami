'use client';

import { Skeleton } from '@heroui/react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ArrowDownWideNarrow,
  BookOpen,
  LoaderCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { parseAsStringEnum, useQueryStates } from 'nuqs';
import { useDebounceValue } from 'usehooks-ts';

import { isRecent, proxyImage, timeAgo } from '~/lib/format';
import { searchParser } from '~/lib/parser';
import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

interface SeriesChaptersProps {
  seriesId: string;
}

const PAGE_SIZE = 24;
const DEFAULT_THUMBNAIL = 'default.jpg';

function releaseLabel(date: string) {
  if (isRecent(date, 30)) return `Rilis ${timeAgo(date)} lalu`;

  return `Rilis ${new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(date))}`;
}

export function SeriesChapters({ seriesId }: SeriesChaptersProps) {
  const [{ search, order }, setParams] = useQueryStates({
    ...searchParser,
    order: parseAsStringEnum(['asc', 'desc'] as const).withDefault('desc'),
  });

  const [debouncedSearch] = useDebounceValue(search, 400);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.chapter.listBySeriesId.infiniteQueryOptions(
      {
        seriesId,
        page_size: PAGE_SIZE,
        search: debouncedSearch,
        sort_order: order,
      },
      {
        getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
        placeholderData: keepPreviousData,
      },
    ),
  );

  const chapters = data?.pages.flatMap((page) => page.data) ?? [];
  const totalRecords = data?.pages[0]?.meta.total_record ?? null;

  const queryClient = useQueryClient();

  return (
    <section
      aria-label="Daftar chapter"
      className="space-y-4 border-t border-border pt-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="accent-gradient flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold">
          <BookOpen className="size-4" />
          Chapter
          {totalRecords !== null && (
            <span className="text-xs font-medium opacity-70">
              {totalRecords}
            </span>
          )}
        </span>

        <div className="ml-auto flex w-full gap-2 sm:w-auto">
          <label className="relative flex-1 sm:w-56">
            <span className="sr-only">Cari chapter</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-9 w-full rounded-lg border border-border bg-(--field-background) pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent"
              defaultValue={search}
              inputMode="numeric"
              placeholder="Cari chapter..."
              type="search"
              onChange={(e) => setParams({ search: e.target.value })}
            />
          </label>

          <button
            aria-label={
              order === 'desc'
                ? 'Urutan: chapter terbaru dulu'
                : 'Urutan: chapter terlama dulu'
            }
            className="flex h-9 items-center gap-1.5 rounded-lg bg-amber-soft px-3 text-sm font-semibold"
            type="button"
            onClick={() =>
              setParams({ order: order === 'desc' ? 'asc' : 'desc' })
            }
          >
            <ArrowDownWideNarrow
              className={cn(
                'size-4 text-accent transition-transform',
                order === 'asc' && 'rotate-180',
              )}
            />
            {order === 'desc' ? 'Terbaru' : 'Terlama'}
          </button>
        </div>
      </div>

      {isError && chapters.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">
          Gagal memuat chapter. Coba lagi nanti.
        </p>
      )}

      {!isLoading && !isError && chapters.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">
          Chapter tidak ditemukan.
        </p>
      )}

      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 12 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-20 rounded-xl" />
              </li>
            ))
          : chapters.map((chapter) => {
              const thumbnail =
                chapter.thumbnail_image_url &&
                !chapter.thumbnail_image_url.endsWith(DEFAULT_THUMBNAIL)
                  ? proxyImage(chapter.thumbnail_image_url)
                  : null;

              return (
                <li key={chapter.chapter_id}>
                  <Link
                    className="panel group relative flex h-20 items-center overflow-hidden transition-colors hover:ring-1 hover:ring-accent/40"
                    href={`/read/${seriesId}/${chapter.chapter_id}`}
                    onPointerEnter={() => {
                      queryClient.prefetchQuery(
                        trpc.chapter.byId.queryOptions({
                          id: chapter.chapter_id,
                        }),
                      );
                    }}
                  >
                    <div className="relative h-full w-32 shrink-0 overflow-hidden">
                      {thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="size-full object-cover opacity-60 transition-opacity group-hover:opacity-90"
                          loading="lazy"
                          src={thumbnail}
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent to-surface" />

                      {isRecent(chapter.release_date) && (
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-bold">
                          <Sparkles className="size-3 text-accent" />
                          Baru
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 px-3">
                      <p className="truncate font-semibold group-hover:text-accent">
                        Chapter {chapter.chapter_number}
                        {chapter.chapter_title && (
                          <span className="font-normal text-muted">
                            {' '}
                            — {chapter.chapter_title}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">
                        {releaseLabel(chapter.release_date)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
      </ul>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            className="flex h-10 items-center gap-2 rounded-xl bg-amber-soft px-5 text-sm font-semibold transition-colors hover:bg-amber-soft/70 disabled:opacity-60"
            disabled={isFetchingNextPage}
            type="button"
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage && (
              <LoaderCircle className="size-4 animate-spin text-accent" />
            )}
            Muat lebih banyak
          </button>
        </div>
      )}
    </section>
  );
}
