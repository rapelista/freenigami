'use client';

import { useQueries, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Pause,
  Play,
  Settings2,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ChapterBookmark } from '~/components/read/[seriesId]/[chapterId]/bookmark';
import { ChapterListSheet } from '~/components/read/[seriesId]/[chapterId]/chapter-list-sheet';
import { SettingsSheet } from '~/components/read/[seriesId]/[chapterId]/settings-sheet';
import { useReaderAutomation } from '~/components/read/[seriesId]/[chapterId]/use-reader-automation';
import { cn } from '~/lib/utils';
import { useReaderSettings } from '~/stores/reader';
import { trpc } from '~/trpc/client';

export default function Layout({ children }: React.PropsWithChildren) {
  const topBarRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [shared, setShared] = useState(false);
  const [chapterListOpen, setChapterListOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
  const chapterNumber = chapter?.data.chapter_number;
  const sheetOpen = chapterListOpen || settingsOpen;

  const { autoScrolling, toggleAutoScroll, countdown, cancelAdvance } =
    useReaderAutomation({
      chapterId,
      ready: !!chapter,
      nextHref: nextChapterId ? `/read/${seriesId}/${nextChapterId}` : null,
      paused: sheetOpen,
    });

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

  // Remember opened chapters for the "Sudah dibaca" marker.
  const markRead = useReaderSettings((state) => state.markRead);

  useEffect(() => {
    markRead(seriesId, chapterId);
  }, [seriesId, chapterId, markRead]);

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
        (target instanceof Element &&
          target.closest('a, button, input, [role="dialog"]'))
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
      ? `${series.title} Chapter ${chapterNumber ?? ''}`
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
    'flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors';
  const softButton = 'bg-amber-soft/70 hover:bg-amber-soft';

  return (
    <div className="relative min-h-svh bg-background">
      <header
        ref={topBarRef}
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b border-border bg-background/90 backdrop-blur transition-transform duration-300',
          !visible && '-translate-y-full',
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3">
          <Link
            aria-label="Kembali ke detail komik"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-soft/70 text-accent hover:bg-amber-soft"
            href={`/series/${seriesId}`}
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="ml-1 min-w-0 flex-1">
            <Link
              className="block truncate text-sm font-semibold hover:text-accent"
              href={`/series/${seriesId}`}
            >
              {series?.title ?? ' '}
            </Link>
            <p className="text-xs text-muted">
              {chapterNumber !== undefined ? `Chapter ${chapterNumber}` : ' '}
            </p>
          </div>

          <ChapterBookmark chapterId={chapterId} seriesId={seriesId} />

          <button
            aria-label="Bagikan"
            className={cn(navButton, softButton, 'h-9')}
            type="button"
            onClick={handleShare}
          >
            <Share2 className="size-4" />
            <span className="max-sm:hidden">
              {shared ? 'Link disalin' : 'Bagikan'}
            </span>
          </button>

          <button
            aria-label="Pengaturan baca"
            className={cn(navButton, softButton, 'h-9 px-2.5')}
            type="button"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-4" />
          </button>
        </div>
      </header>

      {children}

      {countdown !== null && (
        <div
          aria-live="polite"
          className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-3"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 py-2 pl-4 pr-2 text-sm shadow-2xl shadow-black/60 backdrop-blur">
            <span>
              Lanjut ke chapter berikutnya dalam{' '}
              <span className="font-semibold text-accent">{countdown}</span> dtk
            </span>
            <button
              className="h-8 rounded-lg bg-amber-soft px-3 font-medium hover:bg-amber-soft/70"
              type="button"
              onClick={cancelAdvance}
            >
              Batal
            </button>
          </div>
        </div>
      )}

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
              aria-label="Chapter sebelumnya"
              className={cn(navButton, softButton)}
              href={`/read/${seriesId}/${prevChapterId}`}
            >
              <ChevronLeft className="size-4" />
              <span className="max-md:hidden">Sebelumnya</span>
            </Link>
          ) : (
            <span
              aria-disabled
              aria-label="Chapter sebelumnya"
              className={cn(navButton, 'bg-amber-soft/40 text-muted')}
            >
              <ChevronLeft className="size-4" />
              <span className="max-md:hidden">Sebelumnya</span>
            </span>
          )}

          <button
            aria-haspopup="dialog"
            className={cn(navButton, softButton)}
            type="button"
            onClick={() => setChapterListOpen(true)}
          >
            <List className="size-4 text-accent" />
            {chapterNumber !== undefined ? `Ch. ${chapterNumber}` : 'Chapter'}
          </button>

          <button
            aria-label={autoScrolling ? 'Jeda autoscroll' : 'Mulai autoscroll'}
            aria-pressed={autoScrolling}
            className={cn(
              navButton,
              autoScrolling ? 'bg-accent/20 text-accent' : softButton,
            )}
            type="button"
            onClick={() => {
              if (!autoScrolling) setVisible(false);
              toggleAutoScroll();
            }}
          >
            {autoScrolling ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4" />
            )}
            <span className="max-sm:hidden">
              {autoScrolling ? 'Jeda' : 'Auto'}
            </span>
          </button>

          <button
            aria-haspopup="dialog"
            aria-label="Pengaturan baca"
            className={cn(navButton, softButton)}
            type="button"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-4" />
            <span className="max-sm:hidden">Mode</span>
          </button>

          {nextChapterId ? (
            <Link
              aria-label="Chapter selanjutnya"
              className={cn(navButton, 'accent-gradient font-semibold')}
              href={`/read/${seriesId}/${nextChapterId}`}
            >
              <span className="max-md:hidden">Selanjutnya</span>
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span
              aria-disabled
              aria-label="Chapter selanjutnya"
              className={cn(navButton, 'bg-accent/20 text-muted')}
            >
              <span className="max-md:hidden">Selanjutnya</span>
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
      </nav>

      <ChapterListSheet
        chapterId={chapterId}
        isOpen={chapterListOpen}
        seriesId={seriesId}
        onOpenChange={setChapterListOpen}
      />

      <SettingsSheet
        chapterNumber={chapterNumber}
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
