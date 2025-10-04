/* eslint-disable @next/next/no-img-element */
'use client';

import { Card } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQueryStates } from 'nuqs';

import { Input } from '~/components/ui/input';
import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { paginationParser, searchParser } from '~/lib/parser';
import { trpc } from '~/trpc/client';

export function Chapters() {
  const { id } = useParams<{ id: string }>();

  const [{ page, search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  const { data } = useQuery(
    trpc.chapter.listBySeriesId.queryOptions(
      {
        seriesId: id,
        page,
        search,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  const totalPages = data?.meta.total_page || 1;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Semua Chapter</h2>

      <div>
        <Input
          className="w-full"
          defaultValue={search}
          placeholder='Cari chapter, misal: "1" atau "10"'
          onChange={(e) => setParams({ search: e.target.value, page: 1 })}
        />
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.data.map((chapter) => (
          <Card key={chapter.chapter_id} asChild>
            <Link
              className="p-0 gap-0 flex-row min-md:max-lg:flex-col"
              href={`/chapter/${chapter.chapter_id}`}
            >
              <div className="aspect-video min-md:max-lg:h-30 h-20">
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
            onPageChange={(page) => setParams({ page })}
          />

          <PaginationInfo currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
