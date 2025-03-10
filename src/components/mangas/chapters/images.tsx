"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ChapterImageType } from "~/types/chapter-image";
import { MangaType } from "~/types/manga";
import { ResponseType } from "~/types/response";

export function ChapterImages({ chapterId }: { chapterId: string }) {
  const router = useRouter();

  const { mangaId } = useParams();

  const queryKey = ["mangas", mangaId, "chapters", chapterId];

  const { data: manga } = useQuery<ResponseType<MangaType>>({
    queryKey: ["mangas", mangaId],
  });

  const { data: images } = useQuery<ResponseType<ChapterImageType>>({
    queryKey,
  });

  return (
    <div className="container mx-auto my-12">
      <div className="mb-12">
        <h1 className="text-3xl">
          <Link
            href={`/read/${manga?.data.manga_id}`}
            className="underline underline-offset-8"
          >
            {manga?.data.title}
          </Link>{" "}
          {images && `- Chapter ${images?.data.chapter_number}`}
        </h1>
      </div>

      <div className="flex flex-col justify-center">
        {images?.data.chapter.data.map((imageId, key) => {
          return (
            <img
              key={key}
              alt={imageId}
              src={`/v1/api/${mangaId}/${chapterId}/${imageId}`}
            />
          );
        })}
      </div>

      <div className="px-4 md:px-0 flex justify-between mt-12">
        <Button
          disabled={!images?.data.prev_chapter_id}
          variant="outline"
          onClick={() => {
            if (images?.data.prev_chapter_id) {
              router.replace(images.data.prev_chapter_id);
            }
          }}
        >
          Chapter Sebelumnya
        </Button>

        <Button
          disabled={!images?.data.next_chapter_id}
          variant="outline"
          onClick={() => {
            if (images?.data.next_chapter_id) {
              router.replace(images.data.next_chapter_id);
            }
          }}
        >
          Chapter Selanjutnya
        </Button>
      </div>
    </div>
  );
}
