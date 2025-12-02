'use client';

import { Card, Skeleton } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsStringEnum, useQueryStates } from 'nuqs';
import { useRef } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { SeriesType } from '~/lib/enum';
import { paginationParser, searchParser } from '~/lib/parser';
import { trpc } from '~/trpc/client';

export function Explore() {
  const ref = useRef<HTMLDivElement>(null);

  const [{ page, page_size, search, type }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
    type: parseAsStringEnum<SeriesType>(Object.values(SeriesType)),
  });

  const [debouncedSearch] = useDebounceValue(search, 500);
  const format = type || undefined;

  const { data, isLoading } = useQuery(
    trpc.series.list.queryOptions(
      {
        page,
        page_size,
        format,
        q: debouncedSearch,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  const totalPages = data?.meta.total_page || 1;

  const scrollToTop = () => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top;

      window.scrollBy({ top: top - 80, behavior: 'smooth' });
    }
  };

  return (
    <div ref={ref} className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {isLoading
          ? Array.from({ length: 24 }, (_, i) => {
              return (
                <Card
                  key={i}
                  className="p-0 relative aspect-5/11"
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
                  className="p-0 aspect-5/11 flex flex-col gap-2 justify-end"
                  variant="transparent"
                >
                  <Link
                    className="flex-1 relative"
                    href={`/series/${series.manga_id}`}
                  >
                    <Image
                      fill
                      alt={series.title}
                      loading="eager"
                      sizes="20vw"
                      src={`/api/proxy/image/${image.split('/').pop()}`}
                    />
                  </Link>

                  <div className="flex items-center justify-center p-2 min-h-16">
                    <Link
                      className="line-clamp-2 text-center"
                      href={`/series/${series.manga_id}`}
                    >
                      {series.title}
                    </Link>
                  </div>
                </Card>
              );
            })}
      </div>

      <div>
        <div className="space-y-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(page) => {
              setParams({ page });
              scrollToTop();
            }}
          />

          <PaginationInfo currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
