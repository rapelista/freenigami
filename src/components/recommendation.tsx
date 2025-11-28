'use client';

import { Card, Skeleton, Tabs } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
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
      <Tabs
        className="w-full max-w-md"
        defaultSelectedKey={type}
        onSelectionChange={(key) => {
          const value = key.toString() as SeriesType;

          if (value !== type) {
            setType(value);
          }
        }}
      >
        <Tabs.ListContainer>
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
        </Tabs.ListContainer>
      </Tabs>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => {
              return (
                <Card
                  key={i}
                  className="p-0 relative aspect-5/10"
                  variant="transparent"
                >
                  <Skeleton className="w-full h-full" />
                </Card>
              );
            })
          : data?.data.map((series) => {
              const image = series.cover_portrait_url || series.cover_image_url;

              return (
                <Card
                  key={series.manga_id}
                  asChild
                  className="p-0 relative aspect-1/2 group"
                  variant="transparent"
                >
                  <Link href={`/series/${series.manga_id}`}>
                    <Image
                      fill
                      alt={series.title}
                      className="group-hover:scale-105 transition-transform duration-200"
                      loading="eager"
                      sizes="25vw"
                      src={`/api/proxy/image/${image.split('/').pop()}`}
                    />

                    <div
                      className="absolute h-full w-full bg-linear-to-b from-0% to-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      id="overlay"
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs font-medium line-clamp-2">
                        {series.title}
                      </p>
                    </div>
                  </Link>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
