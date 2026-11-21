'use client';

import { Skeleton } from '@heroui/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Clapperboard, LoaderCircle, Star, TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import type { AnimeCard } from '~/services/anime/mikonime';
import { trpc } from '~/trpc/client';

const PAGE_SIZE = 30;

/**
 * Anime catalog with infinite scroll: one API page (limit + offset) at a
 * time, the next one requested when a sentinel nears the viewport.
 */
export function AnimeList() {
  const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery(
    trpc.anime.list.infiniteQueryOptions(
      { limit: PAGE_SIZE },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  // Offset paging can repeat an item if a new anime lands mid-scroll.
  const seen = new Set<number>();
  const animes =
    data?.pages
      .flatMap((page) => page.data)
      .filter((a) => !seen.has(a.id) && seen.add(a.id)) ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasNextPage || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '600px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, error, animes.length]);

  if (error && !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {isPending
          ? Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} />)
          : animes.map((anime, i) => (
              <AnimeCardItem key={anime.id} anime={anime} eager={i < 6} />
            ))}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <LoaderCircle className="size-6 animate-spin text-accent" />
        )}
        {error && data && (
          <button
            className="rounded-lg bg-amber-soft/70 px-4 py-2 text-sm hover:bg-amber-soft"
            type="button"
            onClick={() => fetchNextPage()}
          >
            Gagal memuat. Coba lagi
          </button>
        )}
        {!hasNextPage && !isPending && !error && (
          <p className="text-sm text-muted">Sudah sampai akhir daftar.</p>
        )}
      </div>
    </div>
  );
}

function AnimeCardItem({ anime, eager }: { anime: AnimeCard; eager: boolean }) {
  // media.mikonime.stream refuses hotlinks from other sites (403), so the
  // poster often fails here; fall back to a title placeholder.
  const [posterFailed, setPosterFailed] = useState(false);

  return (
    <Link
      className="group flex flex-col overflow-hidden rounded-xl bg-surface"
      href={`/anime/${anime.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-secondary">
        {anime.poster && !posterFailed ? (
          <Image
            fill
            alt={anime.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading={eager ? 'eager' : 'lazy'}
            sizes="(min-width: 1024px) 200px, 45vw"
            src={anime.poster}
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-amber-soft via-surface-secondary to-surface p-4">
            <Clapperboard className="size-10 text-accent/40" />
          </div>
        )}
        {anime.format && (
          <span className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {anime.format}
          </span>
        )}
        {!!anime.rating && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <Star className="size-3 fill-accent text-accent" />
            {anime.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="space-y-1 p-2.5">
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold group-hover:text-accent">
          {anime.title}
        </h3>
        <p className="truncate text-xs text-muted">
          {[anime.year, anime.airing_status].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-2 p-2.5">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <TriangleAlert className="size-8 text-accent" />
      <p className="font-semibold">Daftar anime tidak bisa dimuat</p>
      <p className="max-w-md text-sm text-muted">
        Server sumber (mikonime) menolak permintaan dari server ini. Playground
        ini saat ini hanya berjalan di lingkungan lokal.
      </p>
      <button
        className="accent-gradient mt-2 rounded-lg px-4 py-2 text-sm font-medium"
        type="button"
        onClick={onRetry}
      >
        Coba lagi
      </button>
    </div>
  );
}
