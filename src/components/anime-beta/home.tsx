'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { Carousel, CarouselItem } from '~/components/ui/carousel';
import { browseHref, episodeHref, STATUS_LABEL } from '~/lib/anime';
import { trpc } from '~/trpc/client';

import { AnimeCardItem } from './card';
import { AnimeHero } from './hero';
import { AnimeRow, AnimeRowSkeleton, AnimeSection } from './section';
import { ErrorState } from './states';

const QUICK_FILTERS = [
  { label: STATUS_LABEL.airing, href: browseHref({ status: 'airing' }) },
  { label: STATUS_LABEL.completed, href: browseHref({ status: 'completed' }) },
  { label: 'Populer', href: browseHref({ sort: 'popular' }) },
  { label: 'Rating Tertinggi', href: browseHref({ sort: 'rating' }) },
  { label: 'Movie', href: browseHref({ format: 'Movie' }) },
  ...[
    'Action',
    'Isekai',
    'Romance',
    'Fantasy',
    'Comedy',
    'Sci-Fi',
    'Slice of Life',
    'Drama',
    'Supernatural',
    'Mystery',
    'Adventure',
    'School',
  ].map((genre) => ({ label: genre, href: browseHref({ genre }) })),
];

const STALE = 5 * 60_000;

export function AnimeHome() {
  const hero = useQuery({
    ...trpc.anime.hero.queryOptions(),
    staleTime: STALE,
  });
  const latest = useQuery({
    ...trpc.anime.latestEpisodes.queryOptions(),
    staleTime: STALE,
  });
  const home = useQuery({
    ...trpc.anime.home.queryOptions(),
    staleTime: STALE,
  });

  return (
    <main className="space-y-10">
      {hero.data ? (
        <AnimeHero items={hero.data} />
      ) : (
        !hero.isError && (
          <div className="h-[340px] animate-pulse rounded-2xl bg-surface sm:h-[400px]" />
        )
      )}

      <nav
        aria-label="Kategori"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4"
      >
        {QUICK_FILTERS.map((f) => (
          <Link
            key={f.label}
            className="h-8 shrink-0 content-center rounded-full border border-border px-3.5 text-sm whitespace-nowrap transition-colors hover:border-accent hover:text-accent"
            href={f.href}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <AnimeSection
        description="Episode yang baru saja rilis"
        moreHref={browseHref({ sort: 'updated' })}
        title="Episode Terbaru"
      >
        {latest.isError ? (
          <ErrorState compact onRetry={() => latest.refetch()} />
        ) : !latest.data ? (
          <AnimeRowSkeleton />
        ) : (
          <Carousel label="Episode terbaru">
            {latest.data.map((e, i) => (
              <CarouselItem key={e.id}>
                <AnimeCardItem
                  anime={{
                    id: e.animeId,
                    slug: e.slug,
                    title: e.title,
                    poster: e.image,
                    year: null,
                    format: null,
                    status: null,
                    rating: null,
                    genres: [],
                  }}
                  badge={
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-accent" />
                      Episode {e.episode}
                    </span>
                  }
                  eager={i < 6}
                  href={episodeHref(e.slug, e.episode)}
                />
              </CarouselItem>
            ))}
          </Carousel>
        )}
      </AnimeSection>

      {home.isError ? (
        <ErrorState compact onRetry={() => home.refetch()} />
      ) : (
        <>
          <HomeRow
            items={home.data?.airing}
            moreHref={browseHref({ status: 'airing' })}
            title="Sedang Tayang"
          />
          <HomeRow
            items={home.data?.popular}
            moreHref={browseHref({ sort: 'popular' })}
            title="Paling Populer"
          />
          <HomeRow
            items={home.data?.topRated}
            moreHref={browseHref({ sort: 'rating' })}
            title="Rating Tertinggi"
          />
          <HomeRow
            items={home.data?.newest}
            moreHref={browseHref({ sort: 'latest' })}
            title="Baru Ditambahkan"
          />
        </>
      )}
    </main>
  );
}

function HomeRow({
  title,
  moreHref,
  items,
}: {
  title: string;
  moreHref: string;
  items?: Parameters<typeof AnimeRow>[0]['items'];
}) {
  return (
    <AnimeSection moreHref={moreHref} title={title}>
      {items ? <AnimeRow items={items} label={title} /> : <AnimeRowSkeleton />}
    </AnimeSection>
  );
}
