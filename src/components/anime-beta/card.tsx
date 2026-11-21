import { Skeleton } from '@heroui/react';
import { Star } from 'lucide-react';
import Link from 'next/link';

import { animeHref, STATUS_LABEL } from '~/lib/anime';
import { cn } from '~/lib/utils';
import type { AnimeCard } from '~/services/anime/catalog';

import { AnimeImage } from './image';

interface AnimeCardItemProps {
  anime: AnimeCard;
  eager?: boolean;
  /** Overrides the link, e.g. straight to an episode. */
  href?: string;
  /** Top-left badge; defaults to the format (TV, Movie, ...). */
  badge?: React.ReactNode;
  className?: string;
}

export function AnimeCardItem({
  anime,
  eager,
  href,
  badge,
  className,
}: AnimeCardItemProps) {
  const meta = [
    anime.year,
    anime.status ? STATUS_LABEL[anime.status] : null,
    anime.genres[0],
  ].filter(Boolean);

  return (
    <Link
      className={cn('group flex flex-col gap-2 outline-none', className)}
      href={href ?? animeHref(anime.slug)}
      title={anime.title}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-secondary ring-accent transition group-focus-visible:ring-2">
        <AnimeImage
          alt={anime.title}
          className="transition-transform duration-300 group-hover:scale-105"
          eager={eager}
          sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 45vw"
          src={anime.poster}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent" />
        {(badge ?? anime.format) && (
          <span className="absolute top-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            {badge ?? anime.format}
          </span>
        )}
        {anime.rating && (
          <span className="absolute right-2 bottom-2 flex items-center gap-0.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            <Star className="size-3 fill-accent text-accent" />
            {anime.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="space-y-0.5 px-0.5">
        <h3 className="line-clamp-2 text-sm leading-5 font-semibold transition-colors group-hover:text-accent">
          {anime.title}
        </h3>
        {meta.length > 0 && (
          <p className="truncate text-xs text-muted">{meta.join(' · ')}</p>
        )}
      </div>
    </Link>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <Skeleton className="h-4 w-4/5 rounded-md" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
    </div>
  );
}

export const ANIME_GRID =
  'grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
