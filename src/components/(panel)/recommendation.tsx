'use client';

import { Skeleton } from '@heroui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, CalendarDays, Flame, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import { Carousel, CarouselItem } from '~/components/ui/carousel';
import { PillTabs } from '~/components/ui/pill-tabs';
import { countryFlag, proxyImage, timeAgo } from '~/lib/format';
import { SortOption } from '~/lib/enum';
import { trpc } from '~/trpc/client';

enum RankTab {
  RECOMMENDED = 'recommended',
  POPULAR = 'popular',
  RATING = 'rating',
  BOOKMARK = 'bookmark',
  LATEST = 'latest',
}

const TABS = [
  { id: RankTab.RECOMMENDED, label: 'Rekomendasi', icon: Sparkles },
  { id: RankTab.POPULAR, label: 'Terpopuler', icon: Flame },
  { id: RankTab.RATING, label: 'Rating Tertinggi', icon: Star },
  { id: RankTab.BOOKMARK, label: 'Bookmark Terbanyak', icon: Bookmark },
  { id: RankTab.LATEST, label: 'Rilis Terbaru', icon: CalendarDays },
];

const SORT_BY_TAB: Record<Exclude<RankTab, RankTab.RECOMMENDED>, SortOption> = {
  [RankTab.POPULAR]: SortOption.Popularity,
  [RankTab.RATING]: SortOption.Rating,
  [RankTab.BOOKMARK]: SortOption.Bookmark,
  [RankTab.LATEST]: SortOption.Latest,
};

interface RankedSeries {
  manga_id: string;
  title: string;
  cover_portrait_url: string;
  cover_image_url: string;
  country_id?: string;
  latest_chapter_number?: number;
  latest_chapter_time?: string;
}

export function Recommendation() {
  const [tab, setTab] = useQueryState(
    'rank',
    parseAsStringEnum<RankTab>(Object.values(RankTab)).withDefault(
      RankTab.RECOMMENDED,
    ),
  );

  const recommended = useQuery({
    ...trpc.series.recommendation.queryOptions({ format: 'manhwa' }),
    enabled: tab === RankTab.RECOMMENDED,
  });

  const ranked = useQuery({
    ...trpc.series.list.queryOptions({
      page: 1,
      page_size: 12,
      sort:
        tab === RankTab.RECOMMENDED ? SortOption.Popularity : SORT_BY_TAB[tab],
      sort_order: 'desc',
    }),
    enabled: tab !== RankTab.RECOMMENDED,
  });

  const { data, isLoading } =
    tab === RankTab.RECOMMENDED ? recommended : ranked;
  const items: RankedSeries[] = data?.data ?? [];

  const queryClient = useQueryClient();

  return (
    <div className="space-y-4">
      <PillTabs items={TABS} label="Peringkat" value={tab} onChange={setTab} />

      <Carousel key={tab} label="Daftar peringkat">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => (
              <CarouselItem key={i}>
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
              </CarouselItem>
            ))
          : items.map((series, index) => (
              <CarouselItem key={series.manga_id}>
                <Link
                  className="group block"
                  href={`/series/${series.manga_id}`}
                  onPointerEnter={() => {
                    queryClient.prefetchQuery(
                      trpc.series.detail.queryOptions({ id: series.manga_id }),
                    );
                  }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface">
                    <Image
                      fill
                      alt={series.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 180px, 40vw"
                      src={proxyImage(
                        series.cover_portrait_url || series.cover_image_url,
                      )}
                    />
                    <FlagBadge code={series.country_id} />
                  </div>

                  <div className="mt-2 flex gap-2">
                    <span className="text-2xl font-bold leading-none text-accent">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold group-hover:text-accent">
                        {series.title}
                      </p>
                      {series.latest_chapter_number !== undefined && (
                        <p className="truncate text-xs text-muted">
                          Ch. {series.latest_chapter_number}
                          {series.latest_chapter_time &&
                            ` · ${timeAgo(series.latest_chapter_time)}`}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
      </Carousel>
    </div>
  );
}

export function FlagBadge({ code }: { code?: string | null }) {
  const flag = countryFlag(code);

  if (!flag) return null;

  return (
    <span
      aria-label={code?.toUpperCase()}
      className="absolute bottom-1.5 right-1.5 rounded bg-background/60 px-1 text-sm leading-5 backdrop-blur"
      role="img"
    >
      {flag}
    </span>
  );
}
