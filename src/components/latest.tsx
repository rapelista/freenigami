'use client';

import { Button, Skeleton, Tabs } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { trpc } from '~/trpc/client';

export function Latest() {
  const { data } = useQuery(trpc.series.list.queryOptions());

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
        {data?.data.map((series) => (
          <div
            key={series.manga_id}
            className="aspect-[5/11] flex flex-col gap-2 justify-end"
          >
            <Skeleton className="flex-1" />

            <div className="flex items-center justify-center p-2 min-h-16">
              <Link
                className="line-clamp-2 text-center"
                href={`/series/${series.manga_id}`}
              >
                {series.title}
              </Link>
            </div>

            <div className="grid gap-2">
              {series.chapters.slice(0, 2).map((chapter) => (
                <Button
                  key={chapter.chapter_id}
                  asChild
                  size="sm"
                  variant="secondary"
                >
                  <Link
                    href={`/series/${series.manga_id}/chapters/${chapter.chapter_id}`}
                  >
                    Chapter {chapter.chapter_number}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
