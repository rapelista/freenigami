import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { BookmarkType } from '~/lib/enum';

export type Bookmark =
  | {
      type: BookmarkType.SERIES;
      value: string;
    }
  | {
      type: BookmarkType.CHAPTERS;
      value: {
        seriesId: string;
        chapterId: string;
      };
    };

export interface BookmarkStore {
  bookmarks: Array<Bookmark>;

  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookmark: Bookmark) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      bookmarks: [],
      addBookmark: (bookmark) => {
        set((state) => ({
          bookmarks: [...state.bookmarks, bookmark],
        }));
      },
      removeBookmark: (bookmark) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => {
            if (b.type !== bookmark.type) return true;

            if (
              b.type === BookmarkType.SERIES &&
              bookmark.type === BookmarkType.SERIES
            ) {
              return b.value !== bookmark.value;
            }

            if (
              b.type === BookmarkType.CHAPTERS &&
              bookmark.type === BookmarkType.CHAPTERS
            ) {
              return !(
                b.value.seriesId === bookmark.value.seriesId &&
                b.value.chapterId === bookmark.value.chapterId
              );
            }

            return true;
          }),
        }));
      },
    }),
    {
      name: 'freenigami-bookmarks',
      version: 1,
    },
  ),
);
