'use client';

import { Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { proxyImage } from '~/lib/format';
import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

const VISIBLE_SIDE = 3;
const AUTOPLAY_MS = 6_000;

/**
 * Cover-flow style showcase of the most popular series.
 */
export function Hero() {
  const { data, isLoading } = useQuery(
    trpc.series.list.queryOptions({
      page: 1,
      page_size: 10,
      sort: 'popularity',
      sort_order: 'desc',
    }),
  );

  const items = data?.data ?? [];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;

    const id = setInterval(
      () => setActive((index) => (index + 1) % items.length),
      AUTOPLAY_MS,
    );

    return () => clearInterval(id);
  }, [paused, items.length]);

  const current = items[active];

  return (
    <section
      aria-label="Komik populer"
      className="relative h-[300px] overflow-hidden rounded-2xl bg-surface md:h-[330px]"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={current.manga_id}
          aria-hidden
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover opacity-30 blur-2xl"
          src={proxyImage(
            current.cover_image_url || current.cover_portrait_url,
          )}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-background/40 via-transparent to-background/80" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          <Skeleton className="h-48 w-32 rounded-xl max-md:hidden" />
          <Skeleton className="h-60 w-44 rounded-xl" />
          <Skeleton className="h-48 w-32 rounded-xl max-md:hidden" />
        </div>
      )}

      <ul className="absolute inset-x-0 top-3 h-full">
        {items.map((series, index) => {
          // Shortest circular distance from the active slide.
          let offset = index - active;

          if (offset > items.length / 2) offset -= items.length;
          if (offset < -items.length / 2) offset += items.length;

          const hidden = Math.abs(offset) > VISIBLE_SIDE;
          const isActive = offset === 0;

          return (
            <li
              key={series.manga_id}
              aria-hidden={hidden}
              className={cn(
                'absolute left-1/2 top-0 w-36 transition-all duration-500 ease-out md:w-48',
                '[--step:118px] md:[--step:170px]',
                hidden && 'pointer-events-none opacity-0',
                !hidden && !isActive && 'opacity-70 hover:opacity-100',
              )}
              style={{
                transform: `translateX(calc(-50% + ${offset} * var(--step))) translateY(${isActive ? 0 : 36}px) scale(${isActive ? 1 : 0.8})`,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              {isActive ? (
                <Link
                  className="block overflow-hidden rounded-xl bg-surface shadow-2xl shadow-black/60"
                  href={`/series/${series.manga_id}`}
                >
                  <Cover series={series} />
                  <p className="line-clamp-1 bg-background/90 px-3 py-3 text-center text-sm font-semibold">
                    {series.title}
                  </p>
                </Link>
              ) : (
                <button
                  aria-label={series.title}
                  className="block w-full overflow-hidden rounded-xl text-left"
                  tabIndex={hidden ? -1 : 0}
                  type="button"
                  onClick={() => setActive(index)}
                >
                  <Cover series={series} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Cover({
  series,
}: {
  series: {
    title: string;
    cover_portrait_url: string;
    cover_image_url: string;
    user_rate: number;
  };
}) {
  return (
    <div className="relative aspect-[3/4] w-full bg-surface-secondary">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={series.title}
        className="absolute inset-0 size-full object-cover"
        draggable={false}
        src={proxyImage(series.cover_portrait_url || series.cover_image_url)}
      />
      {series.user_rate > 0 && <RatingBadge value={series.user_rate} />}
    </div>
  );
}

export function RatingBadge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-background/75 px-1.5 py-0.5 text-xs font-semibold backdrop-blur',
        className,
      )}
    >
      <Star className="size-3 fill-accent text-accent" />
      {value.toFixed(1)}
    </span>
  );
}
