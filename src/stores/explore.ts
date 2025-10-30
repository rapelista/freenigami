'use client';

import { create } from 'zustand';

interface ExploreStore {
  isSettingsExpanded: boolean;
  toggleSettings: () => void;
}

export const useExploreStore = create<ExploreStore>((set) => ({
  isSettingsExpanded: false,
  toggleSettings: () =>
    set((state) => ({
      isSettingsExpanded: !state.isSettingsExpanded,
    })),
}));
