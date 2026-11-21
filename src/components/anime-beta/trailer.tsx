'use client';

import { Clapperboard, X } from 'lucide-react';
import { useEffect, useState } from 'react';

/** "Trailer" button opening a YouTube player in an overlay. */
export function TrailerButton({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const overflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Clapperboard className="size-4" />
        Trailer
      </button>
      {open && (
        <div
          aria-label={`Trailer ${title}`}
          aria-modal="true"
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/85 p-4"
          role="dialog"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-4xl space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                aria-label="Tutup trailer"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <iframe
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              className="aspect-video w-full rounded-xl bg-black"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`Trailer ${title}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
