/* eslint-disable @next/next/no-img-element */

'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

export function ChapterDetail() {
  const { id } = useParams<{ id: string }>();

  const { data } = useQuery(trpc.chapter.byId.queryOptions({ id }));

  const hasNextChapter = Boolean(data?.data.next_chapter_id);
  const hasPrevChapter = Boolean(data?.data.prev_chapter_id);

  return (
    <>
      <div className="sticky top-0 border-y bg-surface-2 z-10">
        <div className="container mx-auto px-4 py-2.5 md:px-0 md:py-5 flex justify-between gap-6">
          <div className="flex-1">
            {data?.data.manga_id ? (
              <SeriesDetail seriesId={data?.data.manga_id || ''} />
            ) : null}
          </div>

          <h2 className="md:text-lg font-medium">
            Chapter {data?.data.chapter_number}
          </h2>
        </div>
      </div>

      <div className="container max-w-[800px] mx-auto min-h-[calc(100svh-144px)] md:min-h-[100svh-212px]">
        {data?.data.chapter.data.map((image) => {
          const url = new URL(data.data.base_url);

          url.pathname = data.data.chapter.path + image;

          return (
            <img
              key={image}
              alt={url.toString()}
              className="w-full"
              src={url.toString()}
            />
          );
        })}
      </div>

      <div className="sticky bottom-0 border-y bg-surface-2 z-10">
        <div className="container mx-auto px-4 py-2.5 md:px-0 md:py-5 flex justify-between gap-6">
          <Link
            className={cn(
              'flex gap-1 md:text-lg font-medium',
              hasPrevChapter ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            href={data?.data.prev_chapter_id || '#'}
          >
            <ChevronLeft />
            <span className="max-md:hidden">Chapter </span> Sebelumnya
          </Link>

          <Link
            className={cn(
              'flex gap-1 md:text-lg font-medium',
              hasNextChapter ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            href={data?.data.next_chapter_id || '#'}
          >
            <span className="max-md:hidden">Chapter </span> Selanjutnya
            <ChevronRight />
          </Link>
        </div>
      </div>
    </>
  );
}

function SeriesDetail({ seriesId }: { seriesId: string }) {
  const { data } = useQuery(trpc.series.detail.queryOptions({ id: seriesId }));

  return (
    <Link
      className={cn(
        'w-fit md:text-lg font-medium line-clamp-1',
        data ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      href={`/series/${seriesId}`}
    >
      {data?.title}
    </Link>
  );
}
