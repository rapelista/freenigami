'use client';

import { useQueries, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ChapterBookmark } from '~/components/read/[seriesId]/[chapterId]/bookmark';
import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

export default function Layout({ children }: React.PropsWithChildren) {
  const topBarRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [shared, setShared] = useState(false);

  const { seriesId, chapterId } = useParams<{
    seriesId: string;
    chapterId: string;
  }>();

  const [{ data: series }, { data: chapter }] = useQueries({
    queries: [
      trpc.series.detail.queryOptions({ id: seriesId!.toString() }),
      trpc.chapter.byId.queryOptions({ id: chapterId!.toString() }),
    ],
  });

  const nextChapterId = chapter?.data.next_chapter_id;
  const prevChapterId = chapter?.data.prev_chapter_id;

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

  // Show the bars again whenever a new chapter opens.
  const [openedChapterId, setOpenedChapterId] = useState(chapterId);

  if (openedChapterId !== chapterId) {
    setOpenedChapterId(chapterId);
    setVisible(true);
  }

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        topBarRef.current?.contains(target) ||
        bottomBarRef.current?.contains(target) ||
        (target instanceof Element && target.closest('a, button'))
      ) {
        return;
      }

      setVisible((value) => !value);
    };

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const nearBottom =
        window.innerHeight + currentScrollY >=
        document.documentElement.scrollHeight - 200;

      if (nearBottom || currentScrollY < 80) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY + 4) {
        setVisible(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    const title = series
      ? `${series.title} Chapter ${chapter?.data.chapter_number ?? ''}`
      : document.title;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2_000);
      }
    } catch {
      // User cancelled the share sheet.
    }
  };

  const navButton =
    'flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors';

  return (
    <div className="relative min-h-svh bg-background">
      <header
        ref={topBarRef}
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b border-border bg-background/90 backdrop-blur transition-transform duration-300',
          !visible && '-translate-y-full',
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3">
          <Link
            aria-label="Kembali ke detail komik"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-soft/70 text-accent hover:bg-amber-soft"
            href={`/series/${seriesId}`}
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              className="block truncate text-sm font-semibold hover:text-accent"
              href={`/series/${seriesId}`}
            >
              {series?.title ?? ' '}
            </Link>
            <p className="text-xs text-muted">
              {chapter ? `Chapter ${chapter.data.chapter_number}` : ' '}
            </p>
          </div>

          <ChapterBookmark chapterId={chapterId} seriesId={seriesId} />

          <button
            aria-label="Bagikan"
            className={cn(
              navButton,
              'h-9 bg-amber-soft/70 hover:bg-amber-soft',
            )}
            type="button"
            onClick={handleShare}
          >
            <Share2 className="size-4" />
            <span className="max-sm:hidden">
              {shared ? 'Link disalin' : 'Bagikan'}
            </span>
          </button>
        </div>
      </header>

      {children}

      <nav
        ref={bottomBarRef}
        aria-label="Navigasi chapter"
        className={cn(
          'fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 transition-all duration-300',
          !visible && 'pointer-events-none translate-y-6 opacity-0',
        )}
      >
        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-background/90 p-1.5 shadow-2xl shadow-black/60 backdrop-blur">
          {prevChapterId ? (
            <Link
              className={cn(navButton, 'bg-amber-soft/70 hover:bg-amber-soft')}
              href={`/read/${seriesId}/${prevChapterId}`}
            >
              <ChevronLeft className="size-4" />
              <span className="max-sm:hidden">Sebelumnya</span>
            </Link>
          ) : (
            <span
              aria-disabled
              className={cn(navButton, 'bg-amber-soft/40 text-muted')}
            >
              <ChevronLeft className="size-4" />
              <span className="max-sm:hidden">Sebelumnya</span>
            </span>
          )}

          <Link
            className={cn(navButton, 'bg-amber-soft/70 hover:bg-amber-soft')}
            href={`/series/${seriesId}`}
          >
            <List className="size-4 text-accent" />
            {chapter ? `Chapter ${chapter.data.chapter_number}` : 'Chapter'}
          </Link>

          {nextChapterId ? (
            <Link
              className={cn(navButton, 'accent-gradient font-semibold')}
              href={`/read/${seriesId}/${nextChapterId}`}
            >
              <span className="max-sm:hidden">Selanjutnya</span>
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span
              aria-disabled
              className={cn(navButton, 'bg-accent/20 text-muted')}
            >
              <span className="max-sm:hidden">Selanjutnya</span>
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
