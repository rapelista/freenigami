'use client';

import { ChevronLeft, ChevronRight, Info, Play, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { animeHref, episodeHref, STATUS_LABEL } from '~/lib/anime';
import { cn } from '~/lib/utils';
import type { Anime } from '~/services/anime/catalog';

import { AnimeImage } from './image';

const AUTOPLAY_MS = 7000;

/** Rotating spotlight of hand-picked titles over their banner art. */
export function AnimeHero({ items }: { items: Anime[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      AUTOPLAY_MS,
    );

    return () => clearInterval(id);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  const go = (delta: number) =>
    setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section
      aria-label="Sorotan"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden rounded-2xl bg-surface"
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((anime, i) => {
        const active = i === index;
        const meta = [
          anime.format,
          anime.year,
          anime.status ? STATUS_LABEL[anime.status] : null,
        ].filter(Boolean);

        return (
          <div
            key={anime.id}
            aria-hidden={!active}
            aria-roledescription="slide"
            className={cn(
              'grid transition-opacity duration-700 [grid-area:1/1]',
              active
                ? 'relative opacity-100'
                : 'pointer-events-none absolute inset-0 opacity-0',
            )}
            inert={!active}
          >
            <div className="absolute inset-0 -z-10">
              <AnimeImage
                alt=""
                className="scale-105 object-[center_25%]"
                eager={i === 0}
                sizes="(min-width: 1152px) 1152px, 100vw"
                src={anime.banner ?? anime.poster}
              />
              <div className="absolute inset-0 bg-linear-to-r from-background via-background/85 to-background/10" />
              <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="flex min-h-[340px] items-end gap-6 p-5 sm:min-h-[400px] sm:p-8">
              <div className="relative hidden aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 md:block">
                <AnimeImage
                  alt={anime.title}
                  eager={i === 0}
                  sizes="160px"
                  src={anime.poster}
                />
              </div>

              <div className="max-w-2xl space-y-3">
                <p className="text-xs font-semibold tracking-widest text-accent uppercase">
                  Sorotan #{i + 1}
                </p>
                <h2 className="line-clamp-2 text-2xl font-extrabold tracking-tight sm:text-4xl">
                  {anime.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/80">
                  {anime.rating && (
                    <span className="flex items-center gap-1 font-semibold text-accent">
                      <Star className="size-4 fill-current" />
                      {anime.rating.toFixed(1)}
                    </span>
                  )}
                  {meta.map((m) => (
                    <span key={String(m)}>{m}</span>
                  ))}
                  {anime.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="rounded-md bg-white/10 px-2 py-0.5 text-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                {anime.synopsis && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-foreground/75 max-sm:line-clamp-2">
                    {anime.synopsis}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Link
                    className="accent-gradient flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
                    href={episodeHref(anime.slug, 1)}
                  >
                    <Play className="size-4 fill-current" />
                    Tonton
                  </Link>
                  <Link
                    className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20"
                    href={animeHref(anime.slug)}
                  >
                    <Info className="size-4" />
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {items.length > 1 && (
        <div className="absolute right-4 bottom-4 flex items-center gap-2 sm:right-6 sm:bottom-6">
          <div className="mr-2 hidden gap-1.5 sm:flex">
            {items.map((anime, i) => (
              <button
                key={anime.id}
                aria-current={i === index}
                aria-label={`Ke sorotan ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index
                    ? 'w-6 bg-accent'
                    : 'w-1.5 bg-white/30 hover:bg-white/50',
                )}
                type="button"
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            aria-label="Sorotan sebelumnya"
            className="flex size-9 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
            type="button"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Sorotan berikutnya"
            className="flex size-9 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
            type="button"
            onClick={() => go(1)}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </section>
  );
}
