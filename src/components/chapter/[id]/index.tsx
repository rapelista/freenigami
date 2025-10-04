/* eslint-disable @next/next/no-img-element */

'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

export function ChapterDetail() {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { id } = useParams<{ id: string }>();
  const { data } = useQuery(trpc.chapter.byId.queryOptions({ id }));

  const hasNextChapter = Boolean(data?.data.next_chapter_id);
  const hasPrevChapter = Boolean(data?.data.prev_chapter_id);

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
    };

    return () => {
      resetScroll();
    };
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const bottom = bottomRef.current;
      const top = topRef.current;

      if (!top) return null;
      if (!bottom) return null;

      const isClickOutside =
        !top.contains(event.target as Node) &&
        !bottom.contains(event.target as Node);

      if (isClickOutside) {
        const hiddenClass = 'opacity-0';
        const visibilityClass = 'opacity-100';
        const pointerEventsNoneClass = 'pointer-events-none';

        const isTopVisible = top.classList.contains(visibilityClass);
        const isBottomVisible = bottom.classList.contains(visibilityClass);

        if (isTopVisible) {
          top.classList.add(pointerEventsNoneClass);
          top.classList.remove(visibilityClass);
          top.classList.add(hiddenClass);
        } else {
          top.classList.remove(hiddenClass);
          top.classList.remove(pointerEventsNoneClass);
          top.classList.add(visibilityClass);
        }

        if (isBottomVisible) {
          bottom.classList.add(pointerEventsNoneClass);
          bottom.classList.remove(visibilityClass);
          bottom.classList.add(hiddenClass);
        } else {
          bottom.classList.remove(hiddenClass);
          bottom.classList.add(visibilityClass);
          bottom.classList.remove(pointerEventsNoneClass);
        }
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        ref={topRef}
        className="sticky opacity-100 top-0 border-y bg-surface-2 z-10"
      >
        <div className="container mx-auto px-4 py-2.5 md:px-0 md:py-5 flex justify-between gap-6">
          <h2
            className={cn(
              'md:text-lg font-medium',
              data ? 'opacity-100' : 'opacity-0',
            )}
          >
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

      <div
        ref={bottomRef}
        className="sticky opacity-100 bottom-0 border-y bg-surface-2 z-10"
      >
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
