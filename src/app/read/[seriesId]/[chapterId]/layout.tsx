'use client';

import { Card } from '@heroui/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

export default function Layout({ children }: React.PropsWithChildren) {
  const router = useRouter();

  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const [isBookmarked, setIsBookmarked] = useState(false);

  const { seriesId, chapterId } = useParams();

  const [{ data: series }, { data: chapter }] = useQueries({
    queries: [
      trpc.series.detail.queryOptions({ id: seriesId!.toString() }),
      trpc.chapter.byId.queryOptions({ id: chapterId!.toString() }),
    ],
  });

  const hasLoaded = !!series || !!chapter;

  const nextChapterId = chapter?.data.next_chapter_id;
  const prevChapterId = chapter?.data.prev_chapter_id;
  const hasNextChapter = !!nextChapterId;
  const hasPrevChapter = !!prevChapterId;

  useEffect(() => {
    async function makeVisible() {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (topBarRef.current) {
        topBarRef.current.dataset.visible = 'true';
      }

      if (bottomBarRef.current) {
        bottomBarRef.current.dataset.visible = 'true';
      }
    }

    makeVisible();
  }, []);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (nextChapterId) {
      queryClient.prefetchQuery(
        trpc.chapter.byId.queryOptions({ id: nextChapterId }),
      );
    }

    if (prevChapterId) {
      queryClient.prefetchQuery(
        trpc.chapter.byId.queryOptions({ id: prevChapterId }),
      );
    }
  }, [nextChapterId, prevChapterId, queryClient]);

  return (
    <div className="relative">
      <div
        ref={topBarRef}
        className={cn(
          'fixed top-4 w-full px-4',
          'data-[visible="true"]:[&>div]:translate-y-0',
          'data-[visible="true"]:[&>div]:opacity-100',
        )}
        data-visible={false}
      >
        <Card
          className={cn(
            'flex-row max-w-6xl mx-auto',
            'transition-all duration-300 ease-in-out',
            '-translate-y-4 opacity-0',
          )}
        >
          <Link href={`/series/${seriesId}`}>
            <ArrowLeft className="size-6" />
          </Link>

          <div className="flex-1 text-center">
            <p
              className={cn(
                'inline-flex gap-1 items-center transition-opacity duration-300 ease-in-out',
                hasLoaded ? 'opacity-100' : 'opacity-0',
              )}
            >
              <Link
                className="line-clamp-1 text-violet-600"
                href={`/series/${seriesId}`}
              >
                {series?.title}
              </Link>
              <ChevronRight className="min-w-4 size-4 stroke-[2.5px]" />
              <span>{chapter?.data.chapter_number}</span>
            </p>
          </div>

          <Link href="/">
            <Home className="size-6" />
          </Link>
        </Card>
      </div>

      {children}

      <div
        ref={bottomBarRef}
        className={cn(
          'flex justify-center gap-4 fixed bottom-6 w-full',
          '[&>button]:inline-flex [&>button]:items-center [&>button]:justify-center [&>button]:bg-surface-tertiary [&>button]:rounded-full [&>button]:size-14 [&>button>svg]:size-6 [&>button]:disabled:opacity-50 [&>button]:disabled:cursor-progress [&>button]:transition-all [&>button]:duration-300 [&>button]:hover:bg-surface-secondary [&>button]:data-[visible="false"]:opacity-0',
          'transition-all duration-300 ease-in-out',
          'translate-y-4 opacity-0',
          'data-[visible="true"]:opacity-100',
          'data-[visible="true"]:translate-0',
        )}
        data-visible={false}
      >
        <button
          data-visible={hasPrevChapter}
          disabled={!hasLoaded}
          onClick={() => {
            if (hasPrevChapter) {
              router.push(`/read/${seriesId}/${chapter.data.prev_chapter_id}`);
            }
          }}
        >
          <ChevronLeft />
        </button>

        <button onClick={() => setIsBookmarked(!isBookmarked)}>
          <Bookmark
            className={cn(isBookmarked ? 'fill-current' : 'fill-none')}
          />
        </button>

        <button
          data-visible={hasNextChapter}
          disabled={!hasLoaded}
          onClick={() => {
            if (hasNextChapter) {
              router.push(`/read/${seriesId}/${chapter.data.next_chapter_id}`);
            }
          }}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
