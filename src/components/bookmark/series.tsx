/* eslint-disable @next/next/no-img-element */

import { Card, Skeleton } from '@heroui/react';
import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';

import { useAppStore } from '~/stores/app';
import { trpc } from '~/trpc/client';

export function BookmarkSeries() {
  const series = useAppStore((state) => state.bookmarks.series);

  const results = useQueries({
    queries: series.map((series) =>
      trpc.series.detail.queryOptions({ id: series.id }),
    ),
  });

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
      {results.map((result, key) => {
        if (result.isLoading) {
          return (
            <Card
              key={key}
              className="p-0 relative aspect-[5/10]"
              variant="flat"
            >
              <Skeleton className="w-full h-full" />
            </Card>
          );
        }

        if (!result.data) return null;

        const image =
          result.data.cover_portrait_url || result.data.cover_image_url;

        const seriesId = series.at(key)?.id;

        return (
          <Card
            key={seriesId}
            asChild
            className="p-0 relative aspect-[5/10]"
            variant="flat"
          >
            <Link className="h-full w-full" href={`/series/${seriesId}`}>
              <img
                alt={result.data.title}
                className="object-cover h-full w-full"
                src={`/api/proxy/image/${image.split('/').pop()}`}
              />
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
