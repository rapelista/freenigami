'use client';

import { Chip, Tabs } from '@heroui/react';
import { useQueryStates } from 'nuqs';

import type { BookmarkType } from '~/lib/enum';
import { bookmarkTypeParser } from '~/lib/parser';
import { useAppStore } from '~/stores/app';

import { BookmarkChapters } from './chapters';
import { BookmarkSeries } from './series';

export function BookmarkList() {
  const [{ type }, setParams] = useQueryStates(bookmarkTypeParser);
  const bookmarks = useAppStore((state) => state.bookmarks);

  const seriesCount = bookmarks.series.length;
  const chaptersCount = bookmarks.chapters.length;

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

      <Tabs.Panel className="pt-6" id="series">
        <BookmarkSeries />
      </Tabs.Panel>

      <Tabs.Panel className="pt-6" id="chapters">
        <BookmarkChapters />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
