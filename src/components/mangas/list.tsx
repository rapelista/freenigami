"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { MangaType } from "~/types/manga";
import { ListResponseType } from "~/types/response";

export function MangaList() {
  const queryKey = ["mangas"];
  const { data } = useQuery<ListResponseType<MangaType>>({ queryKey });

  return (
    <div className="container mx-auto grid grid-cols-4 gap-4 my-12">
      {data?.data.map((manga, key) => {
        const thumbnail = manga.cover_portrait_url.split("/").pop();

        return (
          <Link key={key} href={`/read/${manga.manga_id}`}>
            <Image
              alt={thumbnail || key.toString()}
              src={`/v1/api/thumbnails/${thumbnail}`}
              height={467}
              width={350}
            />
          </Link>
        );
      })}
    </div>
  );
}
