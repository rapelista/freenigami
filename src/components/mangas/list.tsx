"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MangaType } from "~/types/manga";
import { ListResponseType } from "~/types/response";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";

export function MangaList() {
  const [search, setSearch] = useState("");

  const queryKey = ["mangas", { q: search }];

  const { data } = useQuery<ListResponseType<MangaType>>({ queryKey });

  return (
    <div className="container px-4 md:px-0 mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 my-12">
      <div className="col-[1/-1]">
        <Input
          placeholder="Cari manga/manhwa/manhua&hellip;"
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
            <Card className="p-2 px-0 pt-0 gap-y-2 overflow-hidden h-full">
              <CardContent className="p-0">
                <Image
                  alt={manga.title}
                  src={`/v1/api/thumbnails/${thumbnail}?type=${type}`}
                  height={467}
                  width={350}
                  className="h-full"
                />
              </CardContent>
              <CardFooter className="p-2">
                <span className="font-semibold">{manga.title}</span>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
