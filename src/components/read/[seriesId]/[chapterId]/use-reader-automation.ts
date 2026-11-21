'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  AUTO_SCROLL_PX_PER_SECOND,
  useReaderSession,
  useReaderSettings,
} from '~/stores/reader';

/** Distance from the bottom of the page that counts as "finished". */
const END_THRESHOLD_PX = 24;

interface ReaderAutomationOptions {
  chapterId: string;
  /** True once the chapter's pages are rendered. */
  ready: boolean;
  /** Href of the next chapter, if any. */
  nextHref: string | null;
  /** Temporarily suspend autoscroll (e.g. while a sheet is open). */
  paused: boolean;
}

function isAtEnd() {
  const { scrollHeight } = document.documentElement;

  // Ignore pages that are still too short (images not loaded yet) or that
  // the reader has not scrolled at all.
  if (scrollHeight < window.innerHeight + 400 || window.scrollY < 200) {
    return false;
  }

  return window.innerHeight + window.scrollY >= scrollHeight - END_THRESHOLD_PX;
}

/**
 * Drives autoscroll and "Infinity Chapter": scrolls at the configured
 * speed and, once the end of the chapter is reached, counts down and opens
 * the next chapter.
 */
export function useReaderAutomation({
  chapterId,
  ready,
  nextHref,
  paused,
}: ReaderAutomationOptions) {
  const router = useRouter();

  const autoScrolling = useReaderSession((state) => state.autoScrolling);
  const setAutoScrolling = useReaderSession((state) => state.setAutoScrolling);
  const speed = useReaderSettings((state) => state.speed);
  const infinityChapter = useReaderSettings((state) => state.infinityChapter);
  const delay = useReaderSettings((state) => state.nextChapterDelay);

  const [atEnd, setAtEnd] = useState(false);
  const [cancelledFor, setCancelledFor] = useState<string | null>(null);

  // Track whether the reader has reached the end of the chapter.
  useEffect(() => {
    if (!ready) return;

    const update = () => setAtEnd(isAtEnd());

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      setAtEnd(false);
    };
  }, [ready, chapterId]);

  // Autoscroll loop.
  useEffect(() => {
    if (!autoScrolling || paused || !ready) return;

    const pxPerSecond = AUTO_SCROLL_PX_PER_SECOND[speed];
    let frame = 0;
    let last = performance.now();
    let carry = 0;

    const tick = (now: number) => {
      // Clamp the delta so a backgrounded tab does not jump on return.
      const delta = Math.min(now - last, 100) / 1000;

      last = now;
      carry += pxPerSecond * delta;

      const step = Math.floor(carry);

      if (step >= 1) {
        carry -= step;
        window.scrollBy(0, step);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [autoScrolling, paused, ready, speed]);

  const shouldAdvance =
    atEnd && infinityChapter && !!nextHref && cancelledFor !== chapterId;

  // Stop autoscroll at the end when there is nothing to advance to.
  useEffect(() => {
    if (atEnd && autoScrolling && !shouldAdvance) setAutoScrolling(false);
  }, [atEnd, autoScrolling, shouldAdvance, setAutoScrolling]);

  // Countdown to the next chapter. Elapsed seconds reset whenever the
  // advance condition flips (adjusting state during render, not in effect).
  const [elapsed, setElapsed] = useState(0);
  const [countingFor, setCountingFor] = useState(shouldAdvance);

  if (countingFor !== shouldAdvance) {
    setCountingFor(shouldAdvance);
    setElapsed(0);
  }

  const remaining = Math.max(delay - elapsed, 0);
  const countdown = shouldAdvance && remaining > 0 ? remaining : null;

  useEffect(() => {
    if (!shouldAdvance || !nextHref) return;

    if (remaining === 0) {
      router.push(nextHref);

      return;
    }

    const id = setTimeout(() => setElapsed((value) => value + 1), 1_000);

    return () => clearTimeout(id);
  }, [shouldAdvance, nextHref, remaining, router]);

  return {
    autoScrolling,
    toggleAutoScroll: () => setAutoScrolling(!autoScrolling),
    countdown,
    cancelAdvance: () => setCancelledFor(chapterId),
  };
}
