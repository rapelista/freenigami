/* eslint-disable @next/next/no-img-element */

'use client';

import { Card, Skeleton } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useQueryStates } from 'nuqs';
import { useDebounceValue } from 'usehooks-ts';

import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { paginationParser, searchParser } from '~/lib/parser';
import { trpc } from '~/trpc/client';

export function Explore() {
  const [{ page, search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  const [debouncedSearch] = useDebounceValue(search, 500);

  const { data, isLoading } = useQuery(
    trpc.series.list.queryOptions(
      {
        page,
        q: debouncedSearch,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  const totalPages = data?.meta.total_page || 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => {
              return (
                <Card
                  key={i}
                  className="p-0 relative aspect-[5/10]"
                  variant="flat"
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
                  className="p-0 relative aspect-[5/10]"
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
                </Card>
              );
            })}
      </div>

      <div>
        <div className="space-y-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(page) => setParams({ page })}
          />

          <PaginationInfo currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
