'use client';

import { ChevronDown } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '~/lib/utils';

/** Synopsis clamped to a few lines, with a toggle when it overflows. */
export function Synopsis({
  text,
  lines = 4,
}: {
  text: string;
  lines?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;

    if (!el) return;
    const check = () =>
      setOverflows(el.scrollHeight > el.clientHeight + 2 || expanded);

    check();
    const observer = new ResizeObserver(check);

    observer.observe(el);

    return () => observer.disconnect();
  }, [expanded, text]);

  if (!text) {
    return <p className="text-sm text-muted italic">Belum ada sinopsis.</p>;
  }

  return (
    <div className="space-y-1.5">
      <p
        ref={ref}
        className="text-sm leading-relaxed whitespace-pre-line text-foreground/80"
        style={
          expanded
            ? undefined
            : {
                WebkitLineClamp: lines,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {text}
      </p>
      {overflows && (
        <button
          aria-expanded={expanded}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:text-amber-deep"
          type="button"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Sembunyikan' : 'Selengkapnya'}
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              expanded && 'rotate-180',
            )}
          />
        </button>
      )}
    </div>
  );
}
