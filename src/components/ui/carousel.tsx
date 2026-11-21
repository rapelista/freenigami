'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '~/lib/utils';

interface CarouselProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

/**
 * Horizontally scrolling, snap-aligned row with previous/next buttons below.
 */
export function Carousel({ children, label, className }: CarouselProps) {
  const ref = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;

    if (!el) return;

    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    update();

    const observer = new ResizeObserver(update);

    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [update, children]);

  const scroll = (direction: 1 | -1) => {
    const el = ref.current;

    if (!el) return;

    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section aria-label={label} className={cn('space-y-4', className)}>
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
        {children}
      </ul>

      {(canPrev || canNext) && (
        <div className="flex justify-center gap-2">
          <button
            aria-label="Sebelumnya"
            className="flex size-8 items-center justify-center rounded-lg bg-amber-soft text-accent transition-opacity disabled:opacity-40"
            disabled={!canPrev}
            type="button"
            onClick={() => scroll(-1)}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="Berikutnya"
            className="flex size-8 items-center justify-center rounded-lg bg-amber-soft text-accent transition-opacity disabled:opacity-40"
            disabled={!canNext}
            type="button"
            onClick={() => scroll(1)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        'w-[42%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[calc((100%-60px)/6)]',
        className,
      )}
    >
      {children}
    </li>
  );
}
