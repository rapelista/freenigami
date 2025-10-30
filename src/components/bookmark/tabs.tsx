'use client';

import { Chip, Tabs } from '@heroui/react';
import { useQueryStates } from 'nuqs';

import { BookmarkType } from '~/lib/enum';
import { bookmarkTypeParser } from '~/lib/parser';
import { useBookmarkStore } from '~/stores/bookmark';

export function BookmarkTabs() {
  const [{ type }, setParams] = useQueryStates(bookmarkTypeParser);

  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  const seriesCount = bookmarks.filter(
    (b) => b.type === BookmarkType.SERIES,
  ).length;

  const chaptersCount = bookmarks.filter(
    (b) => b.type === BookmarkType.CHAPTERS,
  ).length;

  return (
    <Tabs.Root
      defaultSelectedKey={type}
      onSelectionChange={(key) => {
        const value = key.toString() as BookmarkType;

        if (value !== type) {
          setParams({ type: value });
        }
      }}
    >
      <Tabs.ListWrapper>
        <Tabs.List aria-label="Bookmark Type" className="w-fit">
          <Tabs.Tab className="gap-2" id="series">
            <span>Series</span>
            {seriesCount > 0 && (
              <Chip className="text-xs" type="accent" variant="secondary">
                {seriesCount}
              </Chip>
            )}
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab className="gap-2" id="chapters">
            <span>Chapters</span>
            {chaptersCount > 0 && (
              <Chip className="text-xs" type="accent" variant="secondary">
                {chaptersCount}
              </Chip>
            )}
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListWrapper>
    </Tabs.Root>
  );
}
