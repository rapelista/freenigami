'use client';

import { Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ListVideo } from 'lucide-react';
import Link from 'next/link';

import { Watch } from '~/components/anime/watch';
import { animeHref, episodeHref } from '~/lib/anime';
import { trpc } from '~/trpc/client';

import { EpisodeList } from './episode-list';
import { ErrorState, isNotFound, NotFoundState } from './states';
import { Synopsis } from './synopsis';
import { WatchTracker } from './watch-tracker';

const STALE = 5 * 60_000;

export function AnimeWatchView({
  slug,
  number,
}: {
  slug: string;
  number: string;
}) {
  const detail = useQuery({
    ...trpc.anime.detail.queryOptions({ slug }),
    staleTime: STALE,
    retry: (count, error) => !isNotFound(error) && count < 2,
  });
  const anime = detail.data;
  const episodes = useQuery({
    ...trpc.anime.episodes.queryOptions({ animeId: anime?.id ?? 0 }),
    enabled: !!anime,
    staleTime: STALE,
  });

  const list = episodes.data ?? [];
  const index = list.findIndex((e) => String(e.number) === number);
  const current = list[index];

  const sources = useQuery({
    ...trpc.anime.sources.queryOptions({ episodeId: current?.id ?? 0 }),
    enabled: !!current,
    staleTime: STALE,
  });

  if (isNotFound(detail.error)) return <NotFoundState />;
  if (detail.isError) return <ErrorState onRetry={() => detail.refetch()} />;
  if (episodes.isError)
    return <ErrorState onRetry={() => episodes.refetch()} />;
  if (!anime || !episodes.data) return <WatchSkeleton />;
  if (!current) return <NotFoundState />;

  const prev = list[index - 1];
  const next = list[index + 1];

  return (
    <main className="space-y-6">
      <title>{`${anime.title} Episode ${current.number} · Anime`}</title>
      <WatchTracker
        episode={current.number}
        poster={anime.poster}
        slug={anime.slug}
        title={anime.title}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1 text-sm text-muted"
      >
        <Link
          className="truncate hover:text-accent"
          href={animeHref(anime.slug)}
        >
          {anime.title}
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <span className="shrink-0 text-foreground">
          Episode {current.number}
        </span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          {sources.isError ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl bg-black text-sm text-muted">
              Server episode gagal dimuat.
              <button
                className="font-medium text-accent"
                type="button"
                onClick={() => sources.refetch()}
              >
                Coba lagi
              </button>
            </div>
          ) : sources.data ? (
            <Watch
              key={current.id}
              nextHref={next && episodeHref(anime.slug, next.number)}
              poster={anime.banner ?? anime.poster}
              sources={sources.data}
              title={`${anime.title} · Episode ${current.number}`}
            />
          ) : (
            <Skeleton className="aspect-video w-full rounded-xl" />
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-bold">
                Episode {current.number}
                {current.title && (
                  <span className="font-normal text-muted">
                    {' '}
                    · {current.title}
                  </span>
                )}
              </h1>
              <Link
                className="text-sm text-accent hover:text-amber-deep"
                href={animeHref(anime.slug)}
              >
                {anime.title}
              </Link>
            </div>
            <div className="flex gap-2">
              {prev && (
                <Link
                  className="flex h-9 items-center gap-1 rounded-lg bg-amber-soft/70 px-3 text-sm hover:bg-amber-soft"
                  href={episodeHref(anime.slug, prev.number)}
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </Link>
              )}
              {next && (
                <Link
                  className="accent-gradient flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium"
                  href={episodeHref(anime.slug, next.number)}
                >
                  Selanjutnya
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="panel space-y-2 p-4">
            <h2 className="text-sm font-semibold">Tentang anime ini</h2>
            <Synopsis lines={3} text={anime.synopsis} />
          </div>
        </section>

        <aside className="panel flex h-fit flex-col gap-3 p-4 lg:sticky lg:top-20 lg:w-80">
          <h2 className="flex items-center gap-2 font-semibold">
            <ListVideo className="size-4 text-accent" />
            Daftar Episode
            <span className="text-sm font-normal text-muted">
              ({list.length})
            </span>
          </h2>
          <EpisodeList
            current={current.number}
            episodes={list}
            slug={anime.slug}
            variant="compact"
          />
        </aside>
      </div>
    </main>
  );
}

function WatchSkeleton() {
  return (
    <main className="flex flex-col gap-6 pt-10 lg:flex-row">
      <div className="flex-1 space-y-4">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-6 w-1/3 rounded-md" />
      </div>
      <Skeleton className="h-96 rounded-xl lg:w-80" />
    </main>
  );
}
