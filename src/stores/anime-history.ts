import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_ENTRIES = 100;

export interface AnimeHistoryEntry {
  slug: string;
  title: string;
  poster: string | null;
  /** Episode number watched most recently. */
  lastEpisode: number;
  /** Every episode number opened, for "watched" marks. */
  watched: number[];
  updatedAt: number;
}

interface AnimeHistoryStore {
  entries: Record<string, AnimeHistoryEntry>;
  record: (
    anime: Pick<AnimeHistoryEntry, 'slug' | 'title' | 'poster'>,
    episode: number,
  ) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useAnimeHistoryStore = create<AnimeHistoryStore>()(
  persist(
    (set) => ({
      entries: {},
      record: (anime, episode) =>
        set((state) => {
          const previous = state.entries[anime.slug];
          const entries = {
            ...state.entries,
            [anime.slug]: {
              ...anime,
              lastEpisode: episode,
              watched: [...new Set([...(previous?.watched ?? []), episode])],
              updatedAt: Date.now(),
            },
          };

          // Keep the most recent ones only.
          const kept = Object.values(entries)
            .toSorted((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, MAX_ENTRIES);

          return { entries: Object.fromEntries(kept.map((e) => [e.slug, e])) };
        }),
      remove: (slug) =>
        set((state) => {
          const { [slug]: _, ...rest } = state.entries;

          return { entries: rest };
        }),
      clear: () => set({ entries: {} }),
    }),
    { name: 'freenigami-anime-history' },
  ),
);

const subscribeHydration = (onChange: () => void) =>
  useAnimeHistoryStore.persist.onFinishHydration(onChange);

/** False until localStorage has been read (always false on the server). */
export function useAnimeHistoryHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    () => useAnimeHistoryStore.persist.hasHydrated(),
    () => false,
  );
}
