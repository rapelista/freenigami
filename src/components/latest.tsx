'use client';

import { Skeleton, Tabs } from '@heroui/react';

export function Latest() {
  return (
    <div className="space-y-4">
      <Tabs className="w-full max-w-md">
        <Tabs.ListWrapper>
          <Tabs.List aria-label="Options" className="w-fit *:w-fit">
            <Tabs.Tab id="project">Project</Tabs.Tab>
            <Tabs.Tab id="mirror">Mirror</Tabs.Tab>
          </Tabs.List>
          <Tabs.Indicator />
        </Tabs.ListWrapper>
      </Tabs>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-[5/9]" />
          </div>
        ))}
      </div>
    </div>
  );
}
