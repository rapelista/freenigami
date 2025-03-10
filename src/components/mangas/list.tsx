"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { MangaType } from "~/types/manga";
import { ListResponseType } from "~/types/response";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function MangaList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("20");
  const [search, setSearch] = useState("");

  const queryKey = ["mangas", { q: search, page_size: Number(limit), page }];

  const { data: mangas } = useQuery<ListResponseType<MangaType>>({ queryKey });

  return (
    <div className="container px-4 md:px-0 mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 my-12">
      <div className="col-[1/-1]">
        <div className="flex gap-x-2">
          <Input
            className="flex-1"
            placeholder="Cari manga/manhwa/manhua&hellip;"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tampilkan" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map(String).map((value) => (
                <SelectItem value={value} key={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {mangas?.data.map((manga, key) => {
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

      <div className="col-[1/-1]">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (mangas) {
                    if (mangas?.meta.page > 1) {
                      setPage(mangas.meta.page - 1);
                    }
                  }
                }}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink isActive>{mangas?.meta.page || 1}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (mangas) {
                    setPage(mangas.meta.page + 1);
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
