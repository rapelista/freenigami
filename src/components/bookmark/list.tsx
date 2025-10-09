'use client';

import { Tabs } from '@heroui/react';
import { useQueryStates } from 'nuqs';

import type { BookmarkType } from '~/lib/enum';
import { bookmarkTypeParser } from '~/lib/parser';

import { BookmarkSeries } from './series';

export function BookmarkList() {
  const [{ type }, setParams] = useQueryStates(bookmarkTypeParser);

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
      <Tabs.ListWrapper>
        <Tabs.List aria-label="Bookmark Type" className="w-fit *:w-fit">
          <Tabs.Tab id="series">
            Series
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="chapters">
            Chapters
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListWrapper>

      <Tabs.Panel className="pt-4" id="series">
        <BookmarkSeries />
      </Tabs.Panel>

      <Tabs.Panel className="pt-4" id="chapters">
        <p>View your chapter bookmarks.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
