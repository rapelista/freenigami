"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { ChapterImageType } from "~/types/chapter-image";
import { MangaType } from "~/types/manga";
import { ResponseType } from "~/types/response";

export function ChapterImages({ chapterId }: { chapterId: string }) {
  const router = useRouter();

  const { mangaId } = useParams();

  const queryKey = ["mangas", mangaId, "chapters", chapterId];

  const { data: manga, isFetching: isFetchingManga } = useQuery<
    ResponseType<MangaType>
  >({
    queryKey: ["mangas", mangaId],
  });

  const { data: images, isFetching: isFetchingImages } = useQuery<
    ResponseType<ChapterImageType>
  >({
    queryKey,
  });

  return (
    <div className="container mx-auto my-12">
      <div className="mb-12 px-4 lg:px-0">
        {isFetchingManga ? (
          <>
            <Skeleton className="hidden md:block w-11/12 h-9" />

            <div className="md:hidden flex flex-col items-center gap-y-2">
              <Skeleton className="md:block w-3/4 h-9" />
              <Skeleton className="md:block w-1/2 h-9" />
            </div>
          </>
        ) : (
          <h1 className="text-3xl hidden md:block">
            <Link
              href={`/read/${manga?.data.manga_id}`}
              className="underline underline-offset-8"
            >
              {manga?.data.title}
            </Link>{" "}
            {images && `- Chapter ${images?.data.chapter_number}`}
          </h1>
        )}

        <h1 className="text-3xl md:hidden text-center flex flex-col gap-y-2">
          <Link href={`/read/${manga?.data.manga_id}`}>
            {manga?.data.title}
          </Link>

          {images && <span>Chapter {images?.data.chapter_number}</span>}
        </h1>
      </div>

      <div className="flex flex-col justify-center min-h-screen">
        {isFetchingImages ? (
          <Skeleton className="h-screen w-full" />
        ) : (
          images?.data.chapter.data.map((imageId, key) => {
            return (
              <img
                key={key}
                alt={imageId}
                src={`/v1/api/${mangaId}/${chapterId}/${imageId}`}
              />
            );
          })
        )}
      </div>

      <div className="px-4 lg:px-0 flex justify-between mt-12">
        <Button
          disabled={!images?.data.prev_chapter_id}
          variant="outline"
          onClick={() => {
            if (images?.data.prev_chapter_id) {
              router.replace(images.data.prev_chapter_id);
            }
          }}
        >
          <ChevronLeftIcon />
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
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
