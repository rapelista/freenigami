/* eslint-disable @next/next/no-img-element */

'use client';

import { Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { trpc } from '~/trpc/client';

import { ChapterBookmark } from './bookmark';

interface ChapterDetailProps {
  chapterId: string;
  seriesId: string;
}

export function ChapterDetail({ chapterId, seriesId }: ChapterDetailProps) {
  const { data, isLoading } = useQuery(
    trpc.chapter.byId.queryOptions({ id: chapterId }),
  );

  const chapter = data?.data;

  return (
    <div className="mx-auto w-full max-w-[720px] pb-28 pt-14">
      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-none" />
          ))}
        </div>
      )}

      {chapter?.chapter.data.map((image, index) => {
        const url = new URL(chapter.base_url);

        url.pathname = chapter.chapter.path + image;

        return (
          <img
            key={image}
            alt={`Halaman ${index + 1}`}
            className="block w-full select-none"
            decoding="async"
            loading={index < 3 ? 'eager' : 'lazy'}
            src={url.toString()}
          />
        );
      })}

      {chapter && (
        <section className="panel mx-3 mt-6 space-y-4 p-5 text-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Selesai baca
            </p>
            <p className="text-lg font-bold">
              Chapter {chapter.chapter_number}
            </p>
            {!chapter.next_chapter_id && (
              <p className="text-sm text-muted">
                Belum ada lanjutannya. Bookmark biar gampang cek update.
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {chapter.next_chapter_id && (
              <Link
                className="accent-gradient flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold"
                href={`/read/${seriesId}/${chapter.next_chapter_id}`}
              >
                Chapter {chapter.next_chapter_number ?? 'selanjutnya'}
                <ChevronRight className="size-4" />
              </Link>
            )}

            <ChapterBookmark
              chapterId={chapterId}
              className="h-10 rounded-xl px-4"
              seriesId={seriesId}
            />

            <Link
              className="flex h-10 items-center gap-1.5 rounded-xl bg-amber-soft/70 px-4 text-sm font-medium hover:bg-amber-soft"
              href={`/series/${seriesId}`}
            >
              <BookOpen className="size-4 text-accent" />
              Lihat Komik
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
