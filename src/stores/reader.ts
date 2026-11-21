import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum AutoScrollSpeed {
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast',
  FLASH = 'flash',
}

/** Scroll speed in CSS pixels per second. */
export const AUTO_SCROLL_PX_PER_SECOND: Record<AutoScrollSpeed, number> = {
  [AutoScrollSpeed.SLOW]: 40,
  [AutoScrollSpeed.NORMAL]: 90,
  [AutoScrollSpeed.FAST]: 180,
  [AutoScrollSpeed.FLASH]: 360,
};

export const AUTO_SCROLL_SPEED_LABEL: Record<AutoScrollSpeed, string> = {
  [AutoScrollSpeed.SLOW]: 'Lambat',
  [AutoScrollSpeed.NORMAL]: 'Normal',
  [AutoScrollSpeed.FAST]: 'Cepat',
  [AutoScrollSpeed.FLASH]: 'Kilat',
};

/** Delay before auto-advancing to the next chapter, in seconds. */
export const NEXT_CHAPTER_DELAYS = [0, 3, 5] as const;

export type NextChapterDelay = (typeof NEXT_CHAPTER_DELAYS)[number];

/** Read chapters kept per series; oldest entries are dropped beyond this. */
const MAX_HISTORY_PER_SERIES = 2_000;

interface ReaderSettingsStore {
  speed: AutoScrollSpeed;
  infinityChapter: boolean;
  nextChapterDelay: NextChapterDelay;
  /** seriesId -> chapterIds the user has opened. */
  history: Record<string, string[]>;

  setSpeed: (speed: AutoScrollSpeed) => void;
  setInfinityChapter: (enabled: boolean) => void;
  setNextChapterDelay: (delay: NextChapterDelay) => void;
  markRead: (seriesId: string, chapterId: string) => void;
}

export const useReaderSettings = create<ReaderSettingsStore>()(
  persist(
    (set) => ({
      speed: AutoScrollSpeed.SLOW,
      infinityChapter: true,
      nextChapterDelay: 3,
      history: {},

      setSpeed: (speed) => set({ speed }),
      setInfinityChapter: (infinityChapter) => set({ infinityChapter }),
      setNextChapterDelay: (nextChapterDelay) => set({ nextChapterDelay }),
      markRead: (seriesId, chapterId) =>
        set((state) => {
          const read = state.history[seriesId] ?? [];

          if (read.includes(chapterId)) return state;

          return {
            history: {
              ...state.history,
              [seriesId]: [...read, chapterId].slice(-MAX_HISTORY_PER_SERIES),
            },
          };
        }),
    }),
    { name: 'reader-settings' },
  ),
);

interface ReaderSessionStore {
  /**
   * Whether autoscroll is running. Not persisted, but kept outside the
   * reader layout so it survives navigating to the next chapter.
   */
  autoScrolling: boolean;
  setAutoScrolling: (value: boolean) => void;
}

export const useReaderSession = create<ReaderSessionStore>()((set) => ({
  autoScrolling: false,
  setAutoScrolling: (autoScrolling) => set({ autoScrolling }),
}));
