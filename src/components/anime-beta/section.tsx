import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Carousel, CarouselItem } from '~/components/ui/carousel';
import type { AnimeCard } from '~/services/anime/catalog';

import { AnimeCardItem, AnimeCardSkeleton } from './card';

interface SectionProps {
  title: string;
  description?: string;
  moreHref?: string;
  children: React.ReactNode;
}

export function AnimeSection({
  title,
  description,
  moreHref,
  children,
}: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {moreHref && (
          <Link
            className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-accent hover:text-amber-deep"
            href={moreHref}
          >
            Lihat semua
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function AnimeRow({
  items,
  label,
}: {
  items: AnimeCard[];
  label: string;
}) {
  return (
    <Carousel label={label}>
      {items.map((anime) => (
        <CarouselItem key={anime.id}>
          <AnimeCardItem anime={anime} />
        </CarouselItem>
      ))}
    </Carousel>
  );
}

export function AnimeRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="w-[42%] shrink-0 sm:w-[30%] md:w-[22%] lg:w-[calc((100%-60px)/6)]"
        >
          <AnimeCardSkeleton />
        </div>
      ))}
    </div>
  );
}
