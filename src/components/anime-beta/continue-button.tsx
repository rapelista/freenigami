'use client';

import { Play } from 'lucide-react';
import Link from 'next/link';

import { episodeHref } from '~/lib/anime';
import {
  useAnimeHistoryHydrated,
  useAnimeHistoryStore,
} from '~/stores/anime-history';

/**
 * Primary action on the detail page: "Lanjutkan Ep N" when this browser
 * has watched the anime before, otherwise start from the first episode.
 */
export function ContinueButton({
  slug,
  firstEpisode,
  episodes,
}: {
  slug: string;
  firstEpisode: number | null;
  episodes: number[];
}) {
  const hydrated = useAnimeHistoryHydrated();
  const last = useAnimeHistoryStore((s) => s.entries[slug]?.lastEpisode);

  if (firstEpisode === null) return null;

  const resume =
    hydrated && last !== undefined && episodes.includes(last) ? last : null;

  return (
    <Link
      className="accent-gradient flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
      href={episodeHref(slug, resume ?? firstEpisode)}
    >
      <Play className="size-4 fill-current" />
      {resume !== null ? `Lanjutkan Ep ${resume}` : `Tonton Ep ${firstEpisode}`}
    </Link>
  );
}
