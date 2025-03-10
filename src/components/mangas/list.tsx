"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MangaType } from "~/types/manga";
import { ListResponseType } from "~/types/response";

export function MangaList() {
  const [search, setSearch] = useState("");

  const queryKey = ["mangas", { q: search }];

  const { data } = useQuery<ListResponseType<MangaType>>({ queryKey });

  return (
    <div className="container mx-auto grid grid-cols-4 gap-4 my-12">
      <div className="col-[1/-1]">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {data?.data.map((manga, key) => {
        const thumbnail = (manga.cover_portrait_url || manga.cover_image_url)
          .split("/")
          .pop();

        const type = manga.cover_portrait_url ? "potrait" : "image";

        return (
          <Link key={key} href={`/read/${manga.manga_id}`}>
            <Image
              alt={manga.title}
              src={`/v1/api/thumbnails/${thumbnail}?type=${type}`}
              height={467}
              width={350}
              className="h-full"
            />
          </Link>
        );
      })}
    </div>
  );
}
