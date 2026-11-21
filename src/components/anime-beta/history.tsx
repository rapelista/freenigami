'use client';

import { History, Play, Trash2, X } from 'lucide-react';
import Link from 'next/link';

import { browseHref, episodeHref } from '~/lib/anime';
import {
  useAnimeHistoryHydrated,
  useAnimeHistoryStore,
} from '~/stores/anime-history';

import { ANIME_GRID, AnimeCardSkeleton } from './card';
import { AnimeImage } from './image';

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Watch history kept in this browser. */
export function AnimeHistory() {
  const hydrated = useAnimeHistoryHydrated();
  const entries = useAnimeHistoryStore((s) => s.entries);
  const remove = useAnimeHistoryStore((s) => s.remove);
  const clear = useAnimeHistoryStore((s) => s.clear);
  const list = Object.values(entries).toSorted(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Tontonan</h1>
          <p className="text-sm text-muted">Tersimpan di browser ini saja.</p>
        </div>
        {hydrated && list.length > 0 && (
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
            type="button"
            onClick={() => {
              if (window.confirm('Hapus semua riwayat tontonan?')) clear();
            }}
          >
            <Trash2 className="size-4" />
            Hapus semua
          </button>
        )}
      </div>

      {!hydrated ? (
        <div className={ANIME_GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <History className="size-9 text-accent" />
          <p className="font-semibold">Belum ada riwayat</p>
          <p className="text-sm text-muted">
            Episode yang kamu tonton akan muncul di sini.
          </p>
          <Link
            className="accent-gradient mt-1 rounded-lg px-4 py-2 text-sm font-medium"
            href={browseHref()}
          >
            Jelajahi anime
          </Link>
        </div>
      ) : (
        <ul className={ANIME_GRID}>
          {list.map((entry) => (
            <li key={entry.slug} className="group relative">
              <Link
                className="flex flex-col gap-2"
                href={episodeHref(entry.slug, entry.lastEpisode)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-secondary">
                  <AnimeImage
                    alt={entry.title}
                    sizes="(min-width: 1024px) 190px, 45vw"
                    src={entry.poster}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="accent-gradient flex size-12 items-center justify-center rounded-full">
                      <Play className="ml-0.5 size-5 fill-current" />
                    </span>
                  </div>
                  <span className="absolute top-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Ep {entry.lastEpisode}
                  </span>
                </div>
                <div className="space-y-0.5 px-0.5">
                  <h3 className="line-clamp-2 text-sm leading-5 font-semibold group-hover:text-accent">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-muted">
                    {entry.watched.length} episode ·{' '}
                    {dateFormat.format(entry.updatedAt)}
                  </p>
                </div>
              </Link>
              <button
                aria-label={`Hapus ${entry.title} dari riwayat`}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
                type="button"
                onClick={() => remove(entry.slug)}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
