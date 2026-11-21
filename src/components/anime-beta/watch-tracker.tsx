'use client';

import { useEffect } from 'react';

import { useAnimeHistoryStore } from '~/stores/anime-history';

/** Records the opened episode in this browser's watch history. */
export function WatchTracker({
  slug,
  title,
  poster,
  episode,
}: {
  slug: string;
  title: string;
  poster: string | null;
  episode: number;
}) {
  const record = useAnimeHistoryStore((s) => s.record);

  useEffect(() => {
    record({ slug, title, poster }, episode);
  }, [record, slug, title, poster, episode]);

  return null;
}
