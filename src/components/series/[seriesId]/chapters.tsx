/* eslint-disable @next/next/no-img-element */
'use client';

import { Card, Skeleton } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useQueryStates } from 'nuqs';
import { useRef } from 'react';

import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { SearchInput } from '~/components/ui/search-input';
import { paginationParser, searchParser } from '~/lib/parser';
import { trpc } from '~/trpc/client';

interface SeriesChaptersProps {
  seriesId: string;
}

export function SeriesChapters({ seriesId }: SeriesChaptersProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ page, search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  const { data, isLoading } = useQuery(
    trpc.chapter.listBySeriesId.queryOptions(
      {
        seriesId,
        page,
        search,
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

      window.scrollBy({ top: top - 16, behavior: 'smooth' });
    }
  };

  return (
    <div ref={ref} className="space-y-4">
      <h2 className="text-xl font-semibold">Semua Chapter</h2>

      <SearchInput
        className="w-full"
        defaultValue={search}
        placeholder='Cari chapter, misal: "1" atau "10"'
        onChange={(e) => setParams({ search: e.target.value, page: 1 })}
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 24 }, (_, i) => (
              <Skeleton
                key={`skeleton-${i}`}
                className="h-20 md:h-[162px] lg:h-[82px]"
              />
            ))
          : data?.data.map((chapter) => (
              <Card key={chapter.chapter_id} asChild>
                <Link
                  className="p-0 gap-0 flex-row md:max-lg:flex-col"
                  href={`/read/${seriesId}/${chapter.chapter_id}`}
                >
                  <div className="aspect-video md:max-lg:h-30 h-20">
                    {chapter.thumbnail_image_url ? (
                      <img
                        alt={chapter.chapter_title}
                        className="h-full w-full object-cover"
                        src={`/api/proxy/image/${chapter.thumbnail_image_url.split('/').pop()}`}
                      />
                    ) : (
                      <div className="h-full w-full bg-default" />
                    )}
                  </div>

                  <Card.Content className="p-2">
                    <span className="max-md:text-lg max-md:font-medium">
                      Chapter {chapter.chapter_number}
                    </span>
                  </Card.Content>
                </Link>
              </Card>
            ))}
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
