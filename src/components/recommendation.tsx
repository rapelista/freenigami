/* eslint-disable @next/next/no-img-element */
'use client';

import { Card, Skeleton, Tabs } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import { SeriesType } from '~/lib/enum';
import { trpc } from '~/trpc/client';

export function Recommendation() {
  const [type, setType] = useQueryState(
    'recommendationType',
    parseAsStringEnum<SeriesType>(Object.values(SeriesType)).withDefault(
      SeriesType.MANHWA,
    ),
  );

  const { data, isLoading } = useQuery(
    trpc.series.recommendation.queryOptions({
      format: type,
    }),
  );

  return (
    <div className="space-y-4">
      <Tabs.Root
        className="w-full max-w-md"
        defaultSelectedKey={type}
        onSelectionChange={(key) => {
          const value = key.toString() as SeriesType;

          if (value !== type) {
            setType(value);
          }
        }}
      >
        <Tabs.ListWrapper>
          <Tabs.List aria-label="Options" className="w-fit *:w-fit">
            <Tabs.Tab id="manhwa">
              <Tabs.Indicator />
              Manhwa
            </Tabs.Tab>
            <Tabs.Tab id="manga">
              <Tabs.Indicator />
              Manga
            </Tabs.Tab>
            <Tabs.Tab id="manhua">
              <Tabs.Indicator />
              Manhua
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListWrapper>
      </Tabs.Root>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => {
              return (
                <Card.Root
                  key={i}
                  className="p-0 relative aspect-5/10"
                  variant="flat"
                >
                  <Skeleton className="w-full h-full" />
                </Card.Root>
              );
            })
          : data?.data.map((series) => {
              const image = series.cover_portrait_url || series.cover_image_url;

              return (
                <Card.Root
                  key={series.manga_id}
                  asChild
                  className="p-0 relative aspect-5/10"
                  variant="flat"
                >
                  <Link
                    className="h-full w-full"
                    href={`/series/${series.manga_id}`}
                  >
                    <img
                      alt={series.title}
                      className="object-cover h-full w-full"
                      src={`/api/proxy/image/${image.split('/').pop()}`}
                    />
                  </Link>
                </Card.Root>
              );
            })}
      </div>
    </div>
  );
}
