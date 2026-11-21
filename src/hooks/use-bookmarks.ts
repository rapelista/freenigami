'use client';

import { useSyncExternalStore } from 'react';

import { useBookmarkStore } from '~/stores/bookmark';

const subscribeHydration = (onChange: () => void) =>
  useBookmarkStore.persist.onFinishHydration(onChange);

/** Bookmarks saved in this browser (localStorage). */
export function useBookmarks() {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useBookmarkStore.persist.hasHydrated(),
    () => false,
  );

  return { bookmarks, isPending: !hydrated };
}
