/* eslint-disable @next/next/no-img-element */

import { Card, Separator, Skeleton } from '@heroui/react';
import { useQueries } from '@tanstack/react-query';
import { BookmarkX } from 'lucide-react';
import Link from 'next/link';

import { useBookmarks } from '~/hooks/use-bookmarks';
import { BookmarkType } from '~/lib/enum';
import { trpc } from '~/trpc/client';

export function BookmarkSeries() {
  const { bookmarks, isPending } = useBookmarks();
  const seriesBookmarks = bookmarks.filter(
    (b) => b.type === BookmarkType.SERIES,
  );

  const results = useQueries({
    queries: seriesBookmarks.map((series) =>
      trpc.series.detail.queryOptions({ id: series.value }),
    ),
  });

  if (isPending) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-0 relative aspect-5/10 overflow-hidden" variant="transparent">
            <Skeleton className="w-full h-full" />
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (seriesBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <BookmarkX className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Kosong</h3>
        <p className="text-foreground-secondary text-center max-w-md mb-6">
          Kamu belum menambahkan series apapun ke bookmarkmu.
        </p>
        <Link
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
          href="/explore"
        >
          Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">
          {seriesBookmarks.length}{' '}
          {seriesBookmarks.length === 1 ? 'series' : 'series'} bookmarked
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {results.map((result, key) => {
          if (result.isLoading) {
            return (
              <Card
                key={key}
                className="p-0 relative aspect-5/10 overflow-hidden"
                variant="transparent"
              >
                <Skeleton className="w-full h-full" />
              </Card>
            );
          }

          if (!result.data) return null;

          const image =
            result.data.cover_portrait_url || result.data.cover_image_url;

          const seriesId = seriesBookmarks.at(key)?.value;

          return (
            <Link
              key={seriesId}
              className="card card--transparent p-0 relative aspect-5/10 overflow-hidden group h-full w-full"
              href={`/series/${seriesId}`}
            >
              <img
                alt={result.data.title}
                className="object-cover h-full w-full transition-transform duration-300 group-hover:scale-105"
                src={`/api/proxy/image/${image.split('/').pop()}`}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-xs font-medium line-clamp-2">
                  {result.data.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
