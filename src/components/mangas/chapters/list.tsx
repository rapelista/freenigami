"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "~/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { ChapterType } from "~/types/chapter";
import { MangaType } from "~/types/manga";
import { ListResponseType, ResponseType } from "~/types/response";

export function ChapterList({ mangaId }: { mangaId: string }) {
  const [limit, setLimit] = useState("100");
  const [page, setPage] = useState(1);

  const queryKey = [
    "mangas",
    mangaId,
    "chapters",
    { page_size: Number(limit), sort_order: "desc", page },
  ];

  const { data: chapters } = useQuery<ListResponseType<ChapterType>>({
    queryKey,
  });
  const { data: manga } = useQuery<ResponseType<MangaType>>({
    queryKey: ["mangas", mangaId],
  });

  return (
    <div className="container px-4 md:px-0 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-12">
      <div className="col-[1/-1] ">
        <div>
          <h1 className="text-3xl">{manga?.data.title}</h1>
        </div>
        <div className="flex justify-end">
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tampilkan" />
            </SelectTrigger>
            <SelectContent>
              {[50, 100, 200, 500].map(String).map((value) => (
                <SelectItem value={value} key={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chapters?.data.map((chapter, key) => {
        const thumbnail = chapter.thumbnail_image_url.split("/").pop();

        return (
          <Link key={key} href={`/read/${mangaId}/${chapter.chapter_id}`}>
            <Card className="flex flex-row p-0 gap-x-2">
              <Image
                alt={thumbnail || key.toString()}
                src={`/v1/api/thumbnails/${thumbnail}?type=potrait`}
                width={140}
                height={84}
              />

              <div className="flex-1 p-2">
                <span className="font-semibold">
                  Chapter {chapter.chapter_number}
                </span>
              </div>
            </Card>
          </Link>
        );
      })}

      <div className="col-[1/-1]">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (chapters) {
                    if (chapters?.meta.page > 1) {
                      setPage(chapters.meta.page - 1);
                    }
                  }
                }}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink isActive>
                {chapters?.meta.page || 1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (chapters) {
                    setPage(chapters.meta.page + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
