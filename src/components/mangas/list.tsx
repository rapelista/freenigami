"use client";

import { useQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
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
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";

export function MangaList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("20");
  const [search, setSearch] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  const queryKey = [
    "mangas",
    {
      q: search,
      page_size: Number(limit),
      page,
      sort: "latest",
      sort_order: "desc",
    },
  ];

  const { data: mangas, isFetching } = useQuery<ListResponseType<MangaType>>({
    queryKey,
  });

  const scrollIntoTopRef = () => {
    if (wrapperRef) {
      const height = wrapperRef.current?.getBoundingClientRect().height;
      if (height) {
        window.scrollTo({ top: 75, behavior: "smooth" });
      }
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="container px-4 lg:px-0 mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 my-12"
    >
      <div className="col-[1/-1]">
        <div className="flex gap-y-4 gap-x-2 flex-wrap">
          <Input
            className="w-full md:flex-1"
            placeholder="Cari manga/manhwa/manhua&hellip;"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-full md:w-[180px]">
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

      {isFetching
        ? Array.from({ length: Number(limit) }).map((_, key) => (
            <Card
              key={key}
              className="p-2 px-0 pt-0 gap-y-2 overflow-hidden h-full"
            >
              <CardContent className="p-0">
                <AspectRatio ratio={9 / 16}>
                  <Skeleton className="h-full w-full" />
                </AspectRatio>
              </CardContent>
              <CardFooter className="p-2 gap-x-4">
                <Skeleton className="h-6 flex-1" />

                {/* <Skeleton className="w-9 h-9 md:w-[114.7px]" /> */}
              </CardFooter>
            </Card>
          ))
        : mangas?.data.map((manga, key) => {
            const thumbnail = (
              manga.cover_portrait_url || manga.cover_image_url
            )
              .split("/")
              .pop();

            return (
              <Link key={key} href={`/read/${manga.manga_id}`}>
                <Card className="hover:bg-card-foreground/5 relative p-2 px-0 pt-0 gap-y-2 overflow-hidden h-full">
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 z-10 bg-secondary/50 hover:bg-secondary/60 text-secondary-foreground"
                  >
                    {manga.user_rate}
                    <StarIcon
                      color="var(--color-yellow-500)"
                      fill="var(--color-yellow-500)"
                    />
                  </Button>

                  <CardContent className="p-0">
                    <AspectRatio ratio={9 / 16}>
                      <Image
                        alt={manga.title}
                        src={`/v1/api/thumbnails/${thumbnail}`}
                        height={467}
                        width={350}
                        className="h-full w-full"
                      />
                    </AspectRatio>
                  </CardContent>
                  <CardFooter className="p-2 gap-x-2">
                    <span className="overflow-ellipsis line-clamp-1 flex-1 font-semibold">
                      {manga.title}
                    </span>

                    {/* <MangaBookmark /> */}
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
                      scrollIntoTopRef();
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
                    scrollIntoTopRef();
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
