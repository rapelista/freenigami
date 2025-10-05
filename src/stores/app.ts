import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  bookmarks: string[];
  addBookmark: (id: string) => void;
  removeBookmark: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      bookmarks: [] as string[],
      addBookmark: (id: string) => {
        set({ bookmarks: [...get().bookmarks, id] });
      },
      removeBookmark: (id: string) => {
        set({
          bookmarks: get().bookmarks.filter((bookmark) => bookmark !== id),
        });
      },
    }),
    {
      name: 'freenigami-storage',
    },
  ),
);
