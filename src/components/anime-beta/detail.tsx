'use client';

import { Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Heart, Star } from 'lucide-react';
import Link from 'next/link';

import { browseHref, formatViews, STATUS_LABEL } from '~/lib/anime';
import type { AnimeDetail } from '~/services/anime/catalog';
import { trpc } from '~/trpc/client';

import { ANIME_GRID, AnimeCardItem, AnimeCardSkeleton } from './card';
import { ContinueButton } from './continue-button';
import { EpisodeList } from './episode-list';
import { AnimeImage } from './image';
import { ErrorState, isNotFound, NotFoundState } from './states';
import { Synopsis } from './synopsis';
import { TrailerButton } from './trailer';

const STALE = 5 * 60_000;

export function AnimeDetailView({ slug }: { slug: string }) {
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
  const recommendations = useQuery({
    ...trpc.anime.recommendations.queryOptions({ slug }),
    enabled: !!anime,
    staleTime: STALE,
  });

  if (isNotFound(detail.error)) return <NotFoundState />;
  if (detail.isError) return <ErrorState onRetry={() => detail.refetch()} />;
  if (!anime) return <DetailSkeleton />;

  const list = episodes.data ?? [];

  const facts: Array<[string, React.ReactNode]> = [
    [
      'Format',
      anime.format && (
        <Link
          className="hover:text-accent"
          href={browseHref({ format: anime.format })}
        >
          {anime.format}
        </Link>
      ),
    ],
    [
      'Status',
      anime.status && (
        <Link
          className="hover:text-accent"
          href={browseHref({ status: anime.status })}
        >
          {STATUS_LABEL[anime.status]}
        </Link>
      ),
    ],
    [
      'Tahun',
      anime.year && (
        <Link
          className="hover:text-accent"
          href={browseHref({ year: anime.year })}
        >
          {anime.year}
        </Link>
      ),
    ],
    [
      'Studio',
      anime.studio && (
        <Link
          className="hover:text-accent"
          href={browseHref({ studio: anime.studio })}
        >
          {anime.studio}
        </Link>
      ),
    ],
    ['Episode', list.length > 0 && `${list.length} episode`],
  ];

  return (
    <main className="space-y-10">
      <title>{`${anime.title} · Anime`}</title>

      <section className="relative isolate -mx-4 overflow-hidden px-4 sm:mx-0 sm:rounded-2xl">
        <div className="absolute inset-0 -z-10">
          <AnimeImage
            eager
            alt=""
            className="object-[center_25%] opacity-60 blur-[2px]"
            sizes="(min-width: 1152px) 1152px, 100vw"
            src={anime.banner ?? anime.poster}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/30" />
        </div>

        <div className="flex flex-col gap-6 pt-24 pb-4 sm:flex-row sm:items-end sm:p-8 sm:pt-40">
          <div className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 sm:w-48">
            <AnimeImage
              eager
              alt={anime.title}
              sizes="192px"
              src={anime.poster}
            />
          </div>

          <div className="min-w-0 space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
              {anime.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/80">
              {anime.rating && (
                <span className="flex items-center gap-1 font-semibold text-accent">
                  <Star className="size-4 fill-current" />
                  {anime.rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1" title="Ditonton">
                <Eye className="size-4" />
                {formatViews(anime.views)}
              </span>
              {anime.likes > 0 && (
                <span className="flex items-center gap-1" title="Disukai">
                  <Heart className="size-4" />
                  {formatViews(anime.likes)}
                </span>
              )}
            </div>
            {anime.genres.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {anime.genres.map((g) => (
                  <li key={g}>
                    <Link
                      className="block rounded-md bg-white/10 px-2 py-0.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                      href={browseHref({ genre: g })}
                    >
                      {g}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {episodes.data ? (
                <ContinueButton
                  episodes={list.map((e) => e.number)}
                  firstEpisode={list[0]?.number ?? null}
                  slug={anime.slug}
                />
              ) : (
                <Skeleton className="h-10 w-36 rounded-xl" />
              )}
              {anime.trailerId && (
                <TrailerButton title={anime.title} videoId={anime.trailerId} />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Sinopsis</h2>
          <Synopsis text={anime.synopsis} />
        </section>
        <dl className="panel grid h-fit grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm lg:grid-cols-1">
          {facts
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
        </dl>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">
          Episode{' '}
          {episodes.data && (
            <span className="text-sm font-normal text-muted">
              ({list.length})
            </span>
          )}
        </h2>
        {episodes.isError ? (
          <ErrorState compact onRetry={() => episodes.refetch()} />
        ) : episodes.data ? (
          <EpisodeList episodes={list} slug={anime.slug} />
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        )}
      </section>

      {anime.characters.length > 0 && <Characters anime={anime} />}

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Rekomendasi</h2>
        {recommendations.isError ? (
          <ErrorState compact onRetry={() => recommendations.refetch()} />
        ) : !recommendations.data ? (
          <div className={ANIME_GRID}>
            {Array.from({ length: 6 }, (_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : recommendations.data.length === 0 ? (
          <p className="text-sm text-muted">Belum ada rekomendasi.</p>
        ) : (
          <div className={ANIME_GRID}>
            {recommendations.data.map((a) => (
              <AnimeCardItem key={a.id} anime={a} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Characters({ anime }: { anime: AnimeDetail }) {
  const list = anime.characters.toSorted(
    (a, b) => Number(b.role === 'Main') - Number(a.role === 'Main'),
  );

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Karakter &amp; Pengisi Suara</h2>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {list.slice(0, 12).map((c) => (
          <li
            key={c.id}
            className="panel flex w-72 shrink-0 items-center gap-3 p-2 sm:w-auto"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-surface-secondary">
              <AnimeImage alt={c.name} sizes="48px" src={c.image} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted">
                {c.role === 'Main' ? 'Utama' : 'Pendukung'}
              </p>
            </div>
            {c.voiceActor && (
              <>
                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-sm">{c.voiceActor.name}</p>
                  <p className="text-xs text-muted">Seiyuu</p>
                </div>
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-surface-secondary">
                  <AnimeImage
                    alt={c.voiceActor.name}
                    sizes="48px"
                    src={c.voiceActor.image}
                  />
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6 pt-24 sm:flex-row sm:items-end sm:p-8 sm:pt-40">
        <Skeleton className="aspect-[3/4] w-36 rounded-xl sm:w-48" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-9 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
    </main>
  );
}
