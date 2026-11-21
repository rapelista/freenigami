'use client';

import { Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, Rocket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { formatCompact, hasRank, proxyImage } from '~/lib/format';
import { cn } from '~/lib/utils';
import { trpc } from '~/trpc/client';

import { SeriesBookmark } from './bookmark';

interface SeriesDetailProps {
  seriesId: string;
}

export function SeriesDetail({ seriesId }: SeriesDetailProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery(
    trpc.series.detail.queryOptions({ id: seriesId }),
  );

  // Oldest chapter, for "Mulai baca".
  const { data: first } = useQuery(
    trpc.chapter.listBySeriesId.queryOptions({
      seriesId,
      page: 1,
      page_size: 1,
      sort_order: 'asc',
    }),
  );

  const firstChapterId = first?.data[0]?.chapter_id;
  const image = data?.cover_portrait_url || data?.cover_image_url;

  const formatName = data?.taxonomy.Format?.[0]?.name;
  const status = data
    ? data.status === 1
      ? 'Ongoing'
      : 'Completed'
    : undefined;

  const genres = data?.taxonomy.Genre ?? [];
  const authors = data?.taxonomy.Author ?? [];
  const artists = data?.taxonomy.Artist ?? [];

  const stats = data
    ? [
        { label: 'Rating', value: data.user_rate.toFixed(1) },
        { label: 'Bookmark', value: formatCompact(data.bookmark_count) },
        { label: 'Views', value: formatCompact(data.view_count) },
        { label: 'Rank', value: hasRank(data.rank) ? `#${data.rank}` : '-' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <button
        aria-label="Kembali"
        className="flex size-10 items-center justify-center rounded-lg bg-amber-soft text-accent transition-colors hover:bg-amber-soft/70"
        type="button"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push('/');
        }}
      >
        <ArrowLeft className="size-4" />
      </button>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        {/* Cover + primary actions */}
        <div className="mx-auto w-full max-w-[220px] space-y-2 md:mx-0">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface">
            {isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <Image
                fill
                priority
                alt={data?.title || 'Series Cover'}
                className="object-cover"
                sizes="220px"
                src={proxyImage(image)}
              />
            )}
          </div>

          <Link
            aria-disabled={!firstChapterId}
            className={cn(
              'accent-gradient flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90',
              !firstChapterId && 'pointer-events-none opacity-50',
            )}
            href={firstChapterId ? `/read/${seriesId}/${firstChapterId}` : '#'}
          >
            <Play className="size-4 fill-current" />
            Mulai baca
          </Link>

          {data?.latest_chapter_id && (
            <Link
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-soft text-sm font-semibold transition-colors hover:bg-amber-soft/70"
              href={`/read/${seriesId}/${data.latest_chapter_id}`}
            >
              <Rocket className="size-4 text-accent" />
              Chapter terbaru
            </Link>
          )}

          <SeriesBookmark seriesId={seriesId} />
        </div>

        {/* Information */}
        <div className="min-w-0 space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3 rounded-lg" />
              <Skeleton className="h-5 w-1/4 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold md:text-3xl">{data?.title}</h1>
              <p className="text-sm font-semibold text-accent">
                {[formatName, status, data?.release_year]
                  .filter(Boolean)
                  .join(' / ')}
              </p>
            </div>
          )}

          <dl className="grid max-w-lg grid-cols-4 gap-2">
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))
              : stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="panel flex flex-col-reverse items-center justify-center gap-0.5 py-3"
                  >
                    <dt className="text-xs text-muted">{stat.label}</dt>
                    <dd className="text-lg font-bold text-accent">
                      {stat.value}
                    </dd>
                  </div>
                ))}
          </dl>

          {(authors.length > 0 || artists.length > 0) && (
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {authors.length > 0 && (
                <div>
                  <dt className="text-xs text-muted">Author</dt>
                  <dd className="font-semibold text-accent">
                    {authors.map((a) => a.name).join(', ')}
                  </dd>
                </div>
              )}
              {artists.length > 0 && (
                <div>
                  <dt className="text-xs text-muted">Artist</dt>
                  <dd className="font-semibold text-accent">
                    {artists.map((a) => a.name).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {isLoading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : (
            data?.description && (
              <div className="space-y-1">
                <p
                  className={cn(
                    'whitespace-pre-line text-sm leading-relaxed text-foreground/80',
                    !expanded && 'line-clamp-3',
                  )}
                >
                  {data.description}
                </p>
                <button
                  className="text-sm font-semibold text-accent hover:underline"
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? 'Sembunyikan' : 'Selengkapnya'}
                </button>
              </div>
            )
          )}

          {data?.alternative_title && (
            <p className="line-clamp-1 text-sm text-muted">
              <span className="font-semibold text-accent">
                Judul alternatif:{' '}
              </span>
              {data.alternative_title}
            </p>
          )}

          {genres.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {genres.map((genre) => (
                <li
                  key={genre.slug}
                  className="rounded-md bg-amber-soft px-2.5 py-1 text-xs font-medium"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
