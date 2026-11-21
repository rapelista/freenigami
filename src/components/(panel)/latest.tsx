'use client';

import { Skeleton } from '@heroui/react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { LayoutPanelLeft, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsStringEnum, useQueryStates } from 'nuqs';
import { useRef } from 'react';

import { FlagBadge } from '~/components/(panel)/recommendation';
import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { PillTabs } from '~/components/ui/pill-tabs';
import { countryFlag, proxyImage, timeAgo } from '~/lib/format';
import { PublishType, SeriesType } from '~/lib/enum';
import { paginationParser } from '~/lib/parser';
import { trpc } from '~/trpc/client';

type LatestTab = PublishType | SeriesType;

const TABS = [
  { id: PublishType.PROJECT, label: 'Project', icon: LayoutPanelLeft },
  { id: PublishType.MIRROR, label: 'Mirror', icon: Layers },
  { id: SeriesType.MANHWA, label: 'Manhwa', prefix: countryFlag('KR') },
  { id: SeriesType.MANHUA, label: 'Manhua', prefix: countryFlag('CN') },
  { id: SeriesType.MANGA, label: 'Manga', prefix: countryFlag('JP') },
] as const;

const PUBLISH_TYPES = Object.values(PublishType) as string[];

export function Latest() {
  const ref = useRef<HTMLDivElement>(null);

  const [{ page, page_size, latest }, setParams] = useQueryStates({
    ...paginationParser,
    latest: parseAsStringEnum<LatestTab>([
      ...Object.values(PublishType),
      ...Object.values(SeriesType),
    ]).withDefault(PublishType.PROJECT),
  });

  const isPublishType = PUBLISH_TYPES.includes(latest);

  const { data, isLoading } = useQuery(
    trpc.series.latest.queryOptions(
      {
        page,
        page_size,
        ...(isPublishType ? { type: latest } : { format: latest }),
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

      window.scrollBy({ top: top - 80, behavior: 'smooth' });
    }
  };

  const queryClient = useQueryClient();

  const prefetchSeries = (id: string) =>
    queryClient.prefetchQuery(trpc.series.detail.queryOptions({ id }));

  return (
    <div ref={ref} className="space-y-4">
      <PillTabs
        items={TABS}
        label="Update terbaru"
        value={latest}
        onChange={(value) => {
          if (value !== latest) setParams({ latest: value, page: 1 });
        }}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: page_size }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-surface">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <div className="space-y-2 p-2.5">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-7 w-full rounded-md" />
                  <Skeleton className="h-7 w-full rounded-md" />
                </div>
              </div>
            ))
          : data?.data.map((series) => (
              <article
                key={series.manga_id}
                className="flex flex-col overflow-hidden rounded-xl bg-surface"
              >
                <Link
                  className="group"
                  href={`/series/${series.manga_id}`}
                  onPointerEnter={() => prefetchSeries(series.manga_id)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface-secondary">
                    <Image
                      fill
                      alt={series.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 200px, 45vw"
                      src={proxyImage(
                        series.cover_portrait_url || series.cover_image_url,
                      )}
                    />
                    <FlagBadge code={series.country_id} />
                  </div>

                  <h3 className="line-clamp-2 min-h-10 px-2.5 pt-2.5 text-sm font-semibold leading-5 group-hover:text-accent">
                    {series.title}
                  </h3>
                </Link>

                <ul className="mt-auto space-y-1.5 p-2.5">
                  {series.chapters.slice(0, 2).map((chapter) => (
                    <li key={chapter.chapter_id}>
                      <Link
                        className="flex items-center justify-between gap-2 rounded-lg bg-linear-to-r from-amber-soft to-surface-secondary px-2 py-1.5 text-xs transition-colors hover:text-accent"
                        href={`/read/${series.manga_id}/${chapter.chapter_id}`}
                        onPointerEnter={() => {
                          queryClient.prefetchQuery(
                            trpc.chapter.byId.queryOptions({
                              id: chapter.chapter_id,
                            }),
                          );
                        }}
                      >
                        <span className="truncate font-medium">
                          Chapter {chapter.chapter_number}
                        </span>
                        <span className="shrink-0 text-muted">
                          {timeAgo(chapter.created_at)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
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
