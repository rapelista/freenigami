'use client';

import { Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { proxyImage } from '~/lib/format';
import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

const VISIBLE_SIDE = 3;
const AUTOPLAY_MS = 6_000;

/** Horizontal distance (px) a drag must cover to count as a swipe. */
const DRAG_THRESHOLD = 40;

/** Card spacing (px); keep in sync with the `--step` classes below. */
const stepWidth = () =>
  window.matchMedia('(min-width: 768px)').matches ? 170 : 118;

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

  // Pointer dragging (mouse and touch). `dragX` follows the pointer while
  // held; on release it snaps by as many cards as were dragged past.
  const [dragX, setDragX] = useState<number | null>(null);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);

  const onPointerDown = (event: React.PointerEvent) => {
    if (items.length < 2 || event.button !== 0) return;

    dragStart.current = event.clientX;
    dragged.current = false;
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragStart.current === null) return;

    const delta = event.clientX - dragStart.current;

    if (!dragged.current && Math.abs(delta) < 5) return;

    if (!dragged.current) {
      dragged.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    setDragX(delta);
  };

  const endDrag = () => {
    if (dragStart.current === null) return;

    dragStart.current = null;

    if (dragX !== null && Math.abs(dragX) >= DRAG_THRESHOLD) {
      const steps = Math.max(1, Math.round(Math.abs(dragX) / stepWidth()));
      const direction = dragX < 0 ? 1 : -1;

      setActive(
        (index) =>
          (((index + direction * steps) % items.length) + items.length) %
          items.length,
      );
    }

    setDragX(null);
  };

  const current = items[active];

  return (
    <section
      aria-label="Komik populer"
      className={cn(
        'relative h-[300px] touch-pan-y select-none overflow-hidden rounded-2xl bg-surface md:h-[330px]',
        dragX !== null ? 'cursor-grabbing' : 'cursor-grab',
      )}
      onClickCapture={(event) => {
        // A drag should not also open the card under the pointer.
        if (dragged.current) {
          event.preventDefault();
          event.stopPropagation();
          dragged.current = false;
        }
      }}
      onPointerCancel={endDrag}
      onPointerDown={onPointerDown}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
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

      <ul className="absolute inset-x-0 top-1/2 h-0">
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
                'absolute left-1/2 top-0 w-36 -translate-y-1/2 md:w-48',
                dragX === null && 'transition-all duration-500 ease-out',
                '[--step:118px] md:[--step:170px]',
                hidden && 'pointer-events-none opacity-0',
                !hidden && !isActive && 'opacity-70 hover:opacity-100',
              )}
              style={{
                transform: `translateX(calc(-50% + ${offset} * var(--step) + ${dragX ?? 0}px)) scale(${isActive ? 1 : 0.8})`,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              {isActive ? (
                <Link
                  className="relative block overflow-hidden rounded-xl bg-surface shadow-2xl shadow-black/60"
                  draggable={false}
                  href={`/series/${series.manga_id}`}
                >
                  <Cover series={series} />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-12">
                    <p className="line-clamp-2 text-center text-sm font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {series.title}
                    </p>
                  </div>
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
