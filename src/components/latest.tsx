'use client';

import { Button, Card, Skeleton, Tabs } from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsStringEnum, useQueryStates } from 'nuqs';
import { useRef } from 'react';

import { Pagination, PaginationInfo } from '~/components/ui/pagination';
import { PublishType } from '~/lib/enum';
import { paginationParser } from '~/lib/parser';
import { trpc } from '~/trpc/client';

export function Latest() {
  const ref = useRef<HTMLDivElement>(null);

  const [{ page, page_size, publishType }, setParams] = useQueryStates({
    ...paginationParser,
    publishType: parseAsStringEnum<PublishType>(
      Object.values(PublishType),
    ).withDefault(PublishType.PROJECT),
  });

  const { data, isLoading } = useQuery(
    trpc.series.latest.queryOptions(
      {
        page,
        page_size,
        type: publishType,
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

      window.scrollBy({ top: top - 64, behavior: 'smooth' });
    }
  };

  return (
    <div ref={ref} className="space-y-4">
      <Tabs
        className="w-full max-w-md"
        defaultSelectedKey={publishType}
        onSelectionChange={(key) => {
          const value = key.toString() as PublishType;

          if (value !== publishType) {
            setParams({ publishType: value, page: 1 });
          }
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Options" className="w-fit *:w-fit">
            <Tabs.Tab id="project">
              <Tabs.Indicator />
              Project
            </Tabs.Tab>
            <Tabs.Tab id="mirror">
              <Tabs.Indicator />
              Mirror
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 24 }, (_, i) => {
              return (
                <Card
                  key={i}
                  className="p-0 aspect-5/11 flex flex-col gap-2 justify-end"
                  variant="transparent"
                >
                  <Skeleton className="w-full h-full" />
                </Card>
              );
            })
          : data?.data.map((series) => {
              const image = series.cover_image_url || series.cover_portrait_url;

              return (
                <Card
                  key={series.manga_id}
                  className="p-0 aspect-5/11 flex flex-col gap-2 justify-end rounded-b-none"
                  variant="transparent"
                >
                  <Link
                    className="relative flex-1"
                    href={`/series/${series.manga_id}`}
                  >
                    <Image
                      fill
                      alt={series.title}
                      loading="eager"
                      sizes="25vw"
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

                  <Card.Footer className="grid gap-2">
                    {series.chapters.slice(0, 2).map((chapter) => (
                      <Button
                        key={chapter.chapter_id}
                        asChild
                        className="w-full"
                        size="sm"
                        variant="tertiary"
                      >
                        <Link
                          href={`/read/${series.manga_id}/${chapter.chapter_id}`}
                        >
                          Chapter {chapter.chapter_number}
                        </Link>
                      </Button>
                    ))}
                  </Card.Footer>
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
