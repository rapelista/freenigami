/* eslint-disable @next/next/no-img-element */
'use client';

import { Accordion, Card, Chip, Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { trpc } from '~/trpc/client';

import { SeriesBookmark } from './bookmark';

export function SeriesDetail() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery(trpc.series.detail.queryOptions({ id }));

  const image = data?.cover_portrait_url || data?.cover_image_url;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center md:flex-row gap-6">
        {/* Cover Image */}
        <div className="shrink-0">
          <Card.Root className="p-0 w-[150px] aspect-2/3 relative overflow-hidden">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <img
                alt={data?.title}
                className="object-cover w-full h-full absolute inset-0"
                src={`/api/proxy/image/${image?.split('/').pop()}`}
              />
            )}
          </Card.Root>
        </div>

        {/* Series Information */}
        <div className="flex-1 space-y-4 w-full md:text-left text-center">
          <div>
            {isLoading ? (
              <Skeleton className="w-1/2 h-8 mb-1 max-md:mx-auto " />
            ) : (
              <h1 className="text-3xl font-bold text-default-900">
                {data?.title}
              </h1>
            )}

            {isLoading ? (
              <div className="space-y-1">
                <Skeleton className="mx-auto h-6.5 w-full" />
                <Skeleton className="mx-auto h-6.5 w-2/3 md:hidden" />
              </div>
            ) : (
              data?.alternative_title && (
                <p className="text-lg text-default-600 mt-1">
                  {data?.alternative_title}
                </p>
              )
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start">
            {isLoading ? (
              <Skeleton className="h-5 w-full mb-1" />
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Rating:</span>
                  <span>{data?.user_rate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Dilihat:</span>
                  <span>{data?.view_count.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Bookmark:</span>
                  <span>{data?.bookmark_count.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Peringkat:</span>
                  <span>#{data?.rank}</span>
                </div>
              </>
            )}
          </div>

          {/* Metadata */}
          {isLoading ? (
            <Skeleton className="h-[26px] w-1/2 max-md:mx-auto" />
          ) : (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Chip variant="secondary">{data?.release_year}</Chip>
              <Chip variant="secondary">
                {data?.status === 1 ? 'Ongoing' : 'Completed'}
              </Chip>
              <Chip variant="secondary">{data?.country_id.toUpperCase()}</Chip>
            </div>
          )}

          <div>
            <SeriesBookmark />
          </div>
        </div>
      </div>

      <Card.Root className="p-0">
        {isLoading ? (
          <Skeleton className="h-[115px]" />
        ) : (
          <Accordion.Root
            allowsMultipleExpanded
            className="w-full"
            isDisabled={isLoading}
          >
            <Accordion.Item key="information">
              <Accordion.Heading>
                <Accordion.Trigger>
                  Informasi
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel className="border-t">
                <Accordion.Body className="pt-4 space-y-2">
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : data ? (
                    <>
                      {!!data?.taxonomy.Type?.length && (
                        <div className="flex flex-wrap gap-1 justify-start">
                          <span className="">Tipe:</span>
                          {data?.taxonomy.Type.map((type) => (
                            <Chip key={type.slug} variant="secondary">
                              {type.name}
                            </Chip>
                          ))}
                        </div>
                      )}

                      {!!data?.taxonomy.Genre?.length && (
                        <div className="flex flex-wrap gap-1 justify-start">
                          <span className="">Genre:</span>
                          {data?.taxonomy.Genre.map((genre) => (
                            <Chip key={genre.slug} variant="secondary">
                              {genre.name}
                            </Chip>
                          ))}
                        </div>
                      )}

                      {!!data?.taxonomy.Author?.length && (
                        <div className="flex flex-wrap gap-1 justify-start">
                          <span className="">Penulis:</span>
                          {data?.taxonomy.Author.map((author) => (
                            <Chip key={author.slug} variant="secondary">
                              {author.name}
                            </Chip>
                          ))}
                        </div>
                      )}

                      {!!data?.taxonomy.Artist?.length && (
                        <div className="flex flex-wrap gap-1 justify-start">
                          <span className="">Artis:</span>
                          {data?.taxonomy.Artist.map((artist) => (
                            <Chip key={artist.slug} variant="secondary">
                              {artist.name}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item key="synopsis">
              <Accordion.Heading>
                <Accordion.Trigger>
                  Sinopsis Lengkap
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel className="border-t">
                <Accordion.Body className="pt-4">
                  <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
                    {data?.description}
                  </p>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
        )}
      </Card.Root>
      <div className="space-y-2" />
    </div>
  );
}
