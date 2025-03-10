"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ChapterType } from "~/types/chapter";
import { ListResponseType } from "~/types/response";

export function ChapterList({ mangaId }: { mangaId: string }) {
  const queryKey = [
    "mangas",
    mangaId,
    "chapters",
    { page_size: 12, sort_order: "asc" },
  ];

  const { data } = useQuery<ListResponseType<ChapterType>>({ queryKey });

  return (
    <div className="container mx-auto grid grid-cols-3 gap-4 my-12">
      {data?.data.map((chapter, key) => {
        const thumbnail = chapter.thumbnail_image_url.split("/").pop();

        return (
          <Link
            key={key}
            href={`/read/${mangaId}/${chapter.chapter_id}`}
            className="border border-gray-200 flex"
          >
            <Image
              alt={thumbnail || key.toString()}
              src={`/v1/api/thumbnails/${thumbnail}`}
              width={140}
              height={84}
            />

            <div className="flex-1 p-2">
              <span className="font-semibold">
                Chapter {chapter.chapter_number}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
