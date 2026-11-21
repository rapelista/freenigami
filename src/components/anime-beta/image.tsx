'use client';

import { Clapperboard } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '~/lib/utils';

interface AnimeImageProps {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
}

/**
 * Remote artwork. The media host 403s requests carrying a foreign Referer
 * (hotlink rule), so the request goes out without one; a placeholder
 * covers files that are genuinely missing.
 */
export function AnimeImage({
  src,
  alt,
  sizes,
  className,
  eager,
}: AnimeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-label={alt}
        className="flex size-full items-center justify-center bg-linear-to-br from-amber-soft via-surface-secondary to-surface"
        role="img"
      >
        <Clapperboard className="size-1/4 max-h-12 max-w-12 text-accent/40" />
      </div>
    );
  }

  return (
    <Image
      fill
      alt={alt}
      className={cn('object-cover', className)}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      sizes={sizes}
      src={src}
      onError={() => setFailed(true)}
    />
  );
}
