/* eslint-disable @next/next/no-img-element */
'use client';

import { Accordion, Card, Chip, Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { trpc } from '~/trpc/client';

export function SeriesDetail() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery(trpc.series.detail.queryOptions({ id }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center md:flex-row gap-6">
          <Skeleton className="w-[150px] h-[225px] rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-4 w-full md:text-left text-center">
            <Skeleton className="h-8 w-3/4 mx-auto md:mx-0" />
            <Skeleton className="h-5 w-1/2 mx-auto md:mx-0" />
            <div className="space-y-2">
              <div className="flex gap-4 justify-center md:justify-start">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex gap-4 justify-center md:justify-start">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex gap-4 justify-center md:justify-start">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex gap-4 justify-center md:justify-start">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <div className="flex gap-2 justify-center md:justify-start">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 mx-auto md:mx-0" />
              <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Card className="p-0">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-default-500">Series tidak ditemukan</p>
      </div>
    );
  }

  const image = data.cover_portrait_url || data.cover_image_url;

  return (
    <div className="space-y-6">
      {/* Header with cover and basic info */}
      <div className="flex flex-col items-center md:flex-row gap-6">
        {/* Cover Image */}
        <div className="flex-shrink-0">
          <Card className="p-0 w-[150px] aspect-[2/3] relative overflow-hidden">
            <img
              alt={data.title}
              className="object-cover w-full h-full absolute inset-0"
              src={`/api/proxy/image/${image.split('/').pop()}`}
            />
          </Card>
        </div>

        {/* Series Information */}
        <div className="flex-1 space-y-4 w-full md:text-left text-center">
          <div>
            <h1 className="text-3xl font-bold text-default-900">
              {data.title}
            </h1>
            {data.alternative_title && (
              <p className="text-lg text-default-600 mt-1">
                {data.alternative_title}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start">
            <div className="flex items-center gap-1">
              <span className="font-semibold">Rating:</span>
              <span>{data.user_rate}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">Dilihat:</span>
              <span>{data.view_count.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">Bookmark:</span>
              <span>{data.bookmark_count.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">Peringkat:</span>
              <span>#{data.rank}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Chip variant="secondary">{data.release_year}</Chip>
            <Chip variant="secondary">
              {data.status === 1 ? 'Ongoing' : 'Completed'}
            </Chip>
            <Chip variant="secondary">{data.country_id.toUpperCase()}</Chip>
          </div>

          {/* Taxonomy */}
          {data.taxonomy && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-default-700">
                Informasi:
              </h3>
              <div className="space-y-2">
                {data.taxonomy.Type?.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                    <span className="text-sm font-medium">Tipe:</span>
                    {data.taxonomy.Type.map((type) => (
                      <Chip key={type.slug} variant="secondary">
                        {type.name}
                      </Chip>
                    ))}
                  </div>
                )}
                {data.taxonomy.Genre?.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                    <span className="text-sm font-medium">Genre:</span>
                    {data.taxonomy.Genre.map((genre) => (
                      <Chip key={genre.slug} variant="secondary">
                        {genre.name}
                      </Chip>
                    ))}
                  </div>
                )}
                {data.taxonomy.Author?.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                    <span className="text-sm font-medium">Penulis:</span>
                    {data.taxonomy.Author.map((author) => (
                      <Chip key={author.slug} variant="secondary">
                        {author.name}
                      </Chip>
                    ))}
                  </div>
                )}
                {data.taxonomy.Artist?.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                    <span className="text-sm font-medium">Artis:</span>
                    {data.taxonomy.Artist.map((artist) => (
                      <Chip key={artist.slug} variant="secondary">
                        {artist.name}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <Card className="p-0">
        <Accordion className="w-full">
          <Accordion.Item key="synopsis" isExpanded>
            <Accordion.Heading>
              <Accordion.Trigger>
                Lihat Sinopsis Lengkap
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel className="border-t">
              <Accordion.Body className="pt-4">
                <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
                  {data.description}
                </p>
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
      <div className="space-y-2" />
    </div>
  );
}
