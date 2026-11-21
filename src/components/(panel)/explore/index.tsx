'use client';

import { Skeleton } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Bookmark, SearchX, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useRef } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { PillTabs } from '~/components/ui/pill-tabs';
import {
  countryFlag,
  formatNumber,
  hasRank,
  proxyImage,
  timeAgo,
} from '~/lib/format';
import { SeriesType } from '~/lib/enum';
import { paginationParser, searchParser } from '~/lib/parser';
import { trpc } from '~/trpc/client';

const FORMAT_TABS = [
  { id: 'all', label: 'Semua' },
  { id: SeriesType.MANHWA, label: 'Manhwa', prefix: countryFlag('KR') },
  { id: SeriesType.MANHUA, label: 'Manhua', prefix: countryFlag('CN') },
  { id: SeriesType.MANGA, label: 'Manga', prefix: countryFlag('JP') },
] as const;

export function Explore() {
  const ref = useRef<HTMLDivElement>(null);

  const [{ page, page_size, search, type, sort, sort_order }, setParams] =
    useQueryStates({
      ...paginationParser,
      ...searchParser,
      type: parseAsStringEnum<SeriesType>(Object.values(SeriesType)),
      sort: parseAsString.withDefault('latest'),
      sort_order: parseAsString.withDefault('desc'),
    });

  const [debouncedSearch] = useDebounceValue(search, 500);
  const format = type || undefined;

  const { data, isLoading } = useQuery(
    trpc.series.list.queryOptions(
      {
        page,
        page_size,
        format,
        q: debouncedSearch,
        sort,
        sort_order,
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
      <PillTabs
        items={FORMAT_TABS}
        label="Format"
        value={type ?? 'all'}
        onChange={(value) =>
          setParams({
            type: value === 'all' ? null : (value as SeriesType),
            page: 1,
          })
        }
      />

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
                  : series.status === 1
                    ? 'Ongoing'
                    : 'Completed';

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
