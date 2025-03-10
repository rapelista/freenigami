"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function ChapterDetail({ chapterId }: { chapterId: string }) {
  const { mangaId } = useParams();

  const { data } = useQuery<{
    data: {
      base_url: string;
      chapter: {
        path: string;
        data: string[];
      };
    };
  }>({
    queryKey: ["chapters", chapterId],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(
        `https://api.shngm.io/v1/chapter/detail/${queryKey[1]}`
      );

      return await response.json();
    },
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
