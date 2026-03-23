'use client';

import { Chip, Tabs } from '@heroui/react';
import { useQueryStates } from 'nuqs';

import { useBookmarks } from '~/hooks/use-bookmarks';
import { BookmarkType } from '~/lib/enum';
import { bookmarkTypeParser } from '~/lib/parser';

export function BookmarkTabs() {
  const [{ type }, setParams] = useQueryStates(bookmarkTypeParser);

  const { bookmarks } = useBookmarks();

  const seriesCount = bookmarks.filter(
    (b) => b.type === BookmarkType.SERIES,
  ).length;

  const chaptersCount = bookmarks.filter(
    (b) => b.type === BookmarkType.CHAPTERS,
  ).length;

  return (
    <Tabs
      defaultSelectedKey={type}
      onSelectionChange={(key) => {
        const value = key.toString() as BookmarkType;

        if (value !== type) {
          setParams({ type: value });
        }
      }}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Bookmark Type" className="w-fit">
          <Tabs.Tab className="gap-2" id="series">
            <span>Series</span>
            {seriesCount > 0 && (
              <Chip className="text-xs" color="default" variant="secondary">
                {seriesCount}
              </Chip>
            )}
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab className="gap-2" id="chapters">
            <span>Chapters</span>
            {chaptersCount > 0 && (
              <Chip className="text-xs" color="default" variant="secondary">
                {chaptersCount}
              </Chip>
            )}
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
