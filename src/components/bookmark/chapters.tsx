'use client';

import { queryOptions, useQueries } from '@tanstack/react-query';
import * as _ from 'lodash-es';
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

  return (
    <div className="space-y-4">
      {results.map((result, key) => {
        if (!result.data) return null;

        return (
          <div key={key}>
            <h2 className="text-lg font-semibold">
              {result.data?.series.title}
            </h2>
            <ul>
              {result.data?.chapters.map((chapter, key) => {
                return (
                  <li key={key}>
                    <Link href={`/chapter/${chapter.chapter_id}`}>
                      Chapter {chapter.chapter_number}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
