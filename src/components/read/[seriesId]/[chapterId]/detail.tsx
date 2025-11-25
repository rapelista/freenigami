/* eslint-disable @next/next/no-img-element */

'use client';

import { useQuery } from '@tanstack/react-query';

import { trpc } from '~/trpc/client';

interface ChapterDetailProps {
  chapterId: string;
  seriesId: string;
}

export function ChapterDetail({
  chapterId,
  seriesId: _seriesId,
}: ChapterDetailProps) {
  const { data } = useQuery(trpc.chapter.byId.queryOptions({ id: chapterId }));

  return (
    <>
      <div className="container max-w-[800px] mx-auto min-h-[calc(100svh-144px)] md:min-h-[100svh-212px] h-fit">
        {data?.data.chapter.data.map((image) => {
          const url = new URL(data.data.base_url);

          url.pathname = data.data.chapter.path + image;

          return (
            <img
              key={image}
              alt={url.toString()}
              className="w-full"
              src={url.toString()}
            />
          );
        })}
      </div>
    </>
  );
}
