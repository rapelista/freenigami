import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type BookmarkSeries = {
  id: string;
};

type BookmarkChapter = {
  id: string;
  seriesId: string;
};

interface AppStore {
  bookmarks: {
    series: BookmarkSeries[];
    chapters: BookmarkChapter[];
  };
  bookmarkSeries: (series: BookmarkSeries) => void;
  removeSeries: (id: string) => void;
  bookmarkChapter: (chapter: BookmarkChapter) => void;
  removeChapter: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      bookmarks: { series: [], chapters: [] },
      bookmarkSeries: (series) =>
        set((state) => ({
          bookmarks: {
            ...state.bookmarks,
            series: [...state.bookmarks.series, series],
          },
        })),
      removeSeries: (id) =>
        set((state) => ({
          bookmarks: {
            ...state.bookmarks,
            series: state.bookmarks.series.filter((s) => s.id !== id),
          },
        })),
      bookmarkChapter: (chapter) =>
        set((state) => ({
          bookmarks: {
            ...state.bookmarks,
            chapters: [...state.bookmarks.chapters, chapter],
          },
        })),
      removeChapter: (id) =>
        set((state) => ({
          bookmarks: {
            ...state.bookmarks,
            chapters: state.bookmarks.chapters.filter((c) => c.id !== id),
          },
        })),
    }),
    {
      name: 'freenigami-storage',
    },
  ),
);
