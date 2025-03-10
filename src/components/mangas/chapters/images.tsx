"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ChapterImageType } from "~/types/chapter-image";
import { ResponseType } from "~/types/response";

export function ChapterImages({ chapterId }: { chapterId: string }) {
  const { mangaId } = useParams();
  const queryKey = ["mangas", mangaId, "chapters", chapterId];

  const { data } = useQuery<ResponseType<ChapterImageType>>({
    queryKey,
  });

  return (
    <div className="container mx-auto my-12">
      <div className="flex flex-col justify-center">
        {data?.data.chapter.data.map((imageId, key) => {
          return (
            <img
              key={key}
              alt={imageId}
              src={`/v1/api/${mangaId}/${chapterId}/${imageId}`}
            />
          );
        })}
      </div>
    </div>
  );
}
