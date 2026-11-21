import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_HISTORY = 8;

interface SearchStore {
  /** Whether the global search dialog is open (not persisted). */
  isOpen: boolean;
  /** Recent search terms, newest first. */
  history: string[];

  setOpen: (isOpen: boolean) => void;
  addHistory: (term: string) => void;
  removeHistory: (term: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      isOpen: false,
      history: [],
      setOpen: (isOpen) => set({ isOpen }),
      addHistory: (term) => {
        const value = term.trim();

        if (!value) return;

        set((state) => ({
          history: [
            value,
            ...state.history.filter(
              (item) => item.toLowerCase() !== value.toLowerCase(),
            ),
          ].slice(0, MAX_HISTORY),
        }));
      },
      removeHistory: (term) =>
        set((state) => ({
          history: state.history.filter((item) => item !== term),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'freenigami-search-history',
      partialize: (state) => ({ history: state.history }),
    },
  ),
);
