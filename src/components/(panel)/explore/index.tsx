'use client';

import { Skeleton } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Bookmark, SearchX, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useQueryStates } from 'nuqs';
import { useRef } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { exploreParsers, SORT_OPTIONS, STATUS_LABEL } from '~/lib/explore';
import { formatNumber, hasRank, proxyImage, timeAgo } from '~/lib/format';
import { trpc } from '~/trpc/client';

export function Explore() {
  const ref = useRef<HTMLDivElement>(null);

  const [params, setParams] = useQueryStates(exploreParsers);
  const { page, page_size, search, sort } = params;

  const [debouncedSearch] = useDebounceValue(search, 500);

  const { data, isLoading } = useQuery(
    trpc.series.list.queryOptions(
      {
        page,
        page_size,
        q: debouncedSearch || undefined,
        type: params.type ?? undefined,
        status: params.status ?? undefined,
        format: params.format ?? undefined,
        subformat: params.subformat ?? undefined,
        genre: params.genre.join(',') || undefined,
        theme: params.theme.join(',') || undefined,
        min_chapters: params.min ?? undefined,
        sort,
        sort_order: SORT_OPTIONS.find((option) => option.value === sort)?.order,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  const totalPages = data?.meta.total_page || 1;

  const scrollToTop = () => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top;

      window.scrollBy({ top: top - 140, behavior: 'smooth' });
    }
  };

  return (
    <div ref={ref} className="space-y-4">
      {!isLoading && data?.data.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-20 text-center text-muted">
          <SearchX className="size-10" />
          <p>Komik tidak ditemukan.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="panel flex gap-3 p-3">
                <Skeleton className="aspect-[3/4] w-24 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-4 w-1/4 rounded-md" />
                </div>
              </div>
            ))
          : data?.data.map((series) => {
              const formatName = series.taxonomy?.Format?.[0]?.name;
              const status =
                series.status === undefined
                  ? undefined
                  : STATUS_LABEL[series.status];

              return (
                <Link
                  key={series.manga_id}
                  className="panel group flex gap-3 p-3 transition-colors hover:ring-1 hover:ring-accent/40"
                  href={`/series/${series.manga_id}`}
                >
                  <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                    <Image
                      fill
                      alt={series.title}
                      className="object-cover"
                      sizes="96px"
                      src={proxyImage(
                        series.cover_portrait_url || series.cover_image_url,
                      )}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="truncate font-semibold group-hover:text-accent">
                      {series.title}
                    </h2>

                    {(formatName || status) && (
                      <p className="text-xs text-muted">
                        {[formatName, status].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    <p className="flex flex-wrap items-center gap-x-2 text-xs">
                      {hasRank(series.rank) && (
                        <span className="font-semibold text-accent">
                          #{series.rank}
                        </span>
                      )}
                      {series.bookmark_count !== undefined && (
                        <span className="flex items-center gap-0.5 text-muted">
                          <Bookmark className="size-3 fill-sky-400 text-sky-400" />
                          {formatNumber(series.bookmark_count)}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-muted">
                        <Star className="size-3 fill-accent text-accent" />
                        {series.user_rate.toFixed(1)}
                      </span>
                    </p>

                    {series.description && (
                      <p className="line-clamp-2 text-xs text-muted">
                        {series.description}
                      </p>
                    )}

                    {series.latest_chapter_number !== undefined && (
                      <p className="mt-auto text-xs">
                        <span className="font-semibold text-accent">
                          Chapter {series.latest_chapter_number}
                        </span>
                        {series.latest_chapter_time && (
                          <span className="text-muted">
                            {' · '}
                            {timeAgo(series.latest_chapter_time)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
      </div>

      <div className="space-y-4 pt-2">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(page) => {
            setParams({ page });
            scrollToTop();
          }}
        />

        <PaginationInfo currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
