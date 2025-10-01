'use client';

import { Skeleton, Tabs } from '@heroui/react';

export function Recommendation() {
  return (
    <div className="space-y-4">
      <Tabs className="w-full max-w-md">
        <Tabs.ListWrapper>
          <Tabs.List aria-label="Options" className="w-fit *:w-fit">
            <Tabs.Tab id="manhwa">Manhwa</Tabs.Tab>
            <Tabs.Tab id="manga">Manga</Tabs.Tab>
            <Tabs.Tab id="manhua">Manhua</Tabs.Tab>
          </Tabs.List>
          <Tabs.Indicator />
        </Tabs.ListWrapper>
      </Tabs>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-[5/9]" />
          </div>
        ))}
      </div>
    </div>
  );
}
