'use client';

import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { episodeHref, type EpisodeItem } from '~/lib/anime';
import { cn } from '~/lib/utils';
import {
  useAnimeHistoryHydrated,
  useAnimeHistoryStore,
} from '~/stores/anime-history';

const CHUNK = 50;

interface EpisodeListProps {
  slug: string;
  episodes: EpisodeItem[];
  /** Episode being watched, highlighted and scrolled into view. */
  current?: number;
  /** `grid` on the detail page, `compact` in the watch sidebar. */
  variant?: 'grid' | 'compact';
}

/**
 * Episode picker: search by number, flip the order, jump between ranges
 * of 50, and see which episodes were already opened in this browser.
 */
export function EpisodeList({
  slug,
  episodes,
  current,
  variant = 'grid',
}: EpisodeListProps) {
  const [query, setQuery] = useState('');
  const [desc, setDesc] = useState(false);
  const hydrated = useAnimeHistoryHydrated();
  const watched = useAnimeHistoryStore((s) => s.entries[slug]?.watched);
  const watchedSet = useMemo(
    () => new Set(hydrated ? (watched ?? []) : []),
    [hydrated, watched],
  );

  const chunks = useMemo(() => {
    const list: Array<{ from: number; to: number; items: EpisodeItem[] }> = [];

    for (let i = 0; i < episodes.length; i += CHUNK) {
      const items = episodes.slice(i, i + CHUNK);

      list.push({ from: items[0]!.number, to: items.at(-1)!.number, items });
    }

    return list;
  }, [episodes]);

  const initialChunk = Math.max(
    0,
    chunks.findIndex(
      (c) => current !== undefined && c.items.some((e) => e.number === current),
    ),
  );
  const [chunk, setChunk] = useState(initialChunk);

  const q = query.trim().toLowerCase();
  const source = q
    ? episodes.filter(
        (e) =>
          String(e.number).startsWith(q) || e.title?.toLowerCase().includes(q),
      )
    : (chunks[chunk]?.items ?? []);
  const shown = desc ? source.toReversed() : source;

  const currentRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  if (episodes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
        Belum ada episode yang tersedia.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Cari nomor episode</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            className="h-9 w-full rounded-lg border border-border bg-(--field-background) pr-3 pl-9 text-sm outline-none placeholder:text-muted focus:border-accent"
            inputMode="numeric"
            placeholder="Cari episode…"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          aria-label={
            desc
              ? 'Urutkan dari episode pertama'
              : 'Urutkan dari episode terbaru'
          }
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-accent transition-colors hover:bg-amber-soft/70"
          title={desc ? 'Terbaru dulu' : 'Terlama dulu'}
          type="button"
          onClick={() => setDesc((v) => !v)}
        >
          {desc ? (
            <ArrowDownWideNarrow className="size-4" />
          ) : (
            <ArrowUpNarrowWide className="size-4" />
          )}
        </button>
      </div>

      {chunks.length > 1 && !q && (
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {chunks.map((c, i) => (
            <button
              key={c.from}
              aria-pressed={i === chunk}
              className={cn(
                'h-7 shrink-0 rounded-md px-2.5 text-xs font-medium transition-colors',
                i === chunk
                  ? 'accent-gradient'
                  : 'bg-surface-secondary hover:bg-surface-tertiary',
              )}
              type="button"
              onClick={() => setChunk(i)}
            >
              {c.from}–{c.to}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">
          Episode “{query}” tidak ditemukan.
        </p>
      ) : (
        <ul
          className={cn(
            variant === 'grid'
              ? 'grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
              : 'grid max-h-[28rem] grid-cols-5 gap-2 overflow-y-auto pr-1 lg:grid-cols-4',
          )}
        >
          {shown.map((e) => {
            const isCurrent = e.number === current;
            const seen = watchedSet.has(e.number);

            return (
              <li key={e.id}>
                <Link
                  ref={isCurrent ? currentRef : undefined}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'relative flex h-10 items-center justify-center rounded-lg text-sm font-semibold tabular-nums transition-colors',
                    isCurrent
                      ? 'accent-gradient'
                      : seen
                        ? 'bg-surface-secondary/60 text-muted hover:bg-surface-tertiary'
                        : 'bg-surface-secondary hover:bg-surface-tertiary',
                  )}
                  href={episodeHref(slug, e.number)}
                  title={[
                    `Episode ${e.number}`,
                    e.title,
                    seen && '(sudah ditonton)',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                >
                  {e.number}
                  {seen && !isCurrent && (
                    <Check className="absolute top-1 right-1 size-3 text-accent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
