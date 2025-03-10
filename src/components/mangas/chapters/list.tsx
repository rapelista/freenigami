"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export function ChapterList({ mangaId }: { mangaId: string }) {
  const { data } = useQuery<{
    data: {
      chapter_id: string;
      chapter_title: string;
      chapter_number: number;
      thumbnail_image_url: string;
    }[];
  }>({
    queryKey: ["manga", mangaId],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(
        `https://api.shngm.io/v1/chapter/${queryKey[1]}/list`
      );

      return await response.json();
    },
  });

  return (
    <div className="container mx-auto grid grid-cols-3 gap-4 my-12">
      {data?.data.map((chapter, key) => (
        <Link
          key={key}
          href={`/read/${mangaId}/${chapter.chapter_id}`}
          className="border border-gray-200 flex"
        >
          <Image
            alt={chapter.thumbnail_image_url}
            src={chapter.thumbnail_image_url}
            width={140}
            height={84}
          />

          <div className="flex-1 p-2">
            <span className="font-semibold">
              Chapter {chapter.chapter_number}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
