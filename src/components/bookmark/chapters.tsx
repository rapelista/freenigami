'use client';

import { Card, Separator, Spinner } from '@heroui/react';
import { queryOptions, useQueries } from '@tanstack/react-query';
import * as _ from 'lodash-es';
import { BookmarkX, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { useAppStore } from '~/stores/app';
import { trpc } from '~/trpc/client';

export function BookmarkChapters() {
  const chapters = useAppStore((state) => state.bookmarks.chapters);
  const chaptersGroupedBySeries = _.groupBy(chapters, 'seriesId');

  const results = useQueries({
    queries: Object.entries(chaptersGroupedBySeries).map(
      ([seriesId, chapters]) => {
        return queryOptions({
          queryKey: ['bookmark', 'chapter', seriesId, chapters.length],
          queryFn: async ({ client }) => {
            const series = await client.fetchQuery(
              trpc.series.detail.queryOptions({ id: seriesId }),
            );

            const chaptersData = await Promise.all(
              chapters.map(async ({ id }) => {
                const data = await client.fetchQuery(
                  trpc.chapter.byId.queryOptions({ id }),
                );

                return data.data;
              }),
            );

            return {
              seriesId,
              series: {
                title: series.title,
              },
              chapters: chaptersData,
            };
          },
        });
      },
    ),
  });

  // Empty state
  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <BookmarkX className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Chapters Bookmarked</h3>
        <p className="text-foreground-secondary text-center max-w-md mb-6">
          Bookmark chapters while reading to easily continue where you left off.
        </p>
        <Link
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
          href="/"
        >
          Browse Manga
        </Link>
      </div>
    );
  }

  // Loading state
  const isLoading = results.some((result) => result.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
        <span className="ml-3 text-foreground-secondary">
          Loading bookmarked chapters...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">
          {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}{' '}
          bookmarked
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        {results.map((result, key) => {
          if (!result.data) return null;

          return (
            <Card.Root key={key} className="p-0" variant="outlined">
              <Card.Header className="pb-3">
                <div className="p-4 pb-0 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Card.Title className="text-lg ">
                      <Link
                        className="hover:text-accent transition-colors line-clamp-2"
                        href={`/series/${result.data.seriesId}`}
                      >
                        {result.data.series.title}
                      </Link>
                    </Card.Title>
                    <Card.Description className="text-xs mt-1">
                      {result.data.chapters.length}{' '}
                      {result.data.chapters.length === 1
                        ? 'chapter'
                        : 'chapters'}
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>

              <Separator className="mb-0" />

              <Card.Content className="p-0">
                <ul className="divide-y divide-border">
                  {result.data.chapters.map((chapter, chapterIndex) => (
                    <li key={chapterIndex}>
                      <Link
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors group"
                        href={`/read/${result.data.seriesId}/${chapter.chapter_id}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-sm font-medium">
                            Chapter {chapter.chapter_number}
                          </span>
                          {chapter.chapter_title && (
                            <>
                              <span className="text-foreground-secondary">
                                •
                              </span>
                              <span className="text-sm text-foreground-secondary truncate">
                                {chapter.chapter_title}
                              </span>
                            </>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card.Content>
            </Card.Root>
          );
        })}
      </div>
    </div>
  );
}
