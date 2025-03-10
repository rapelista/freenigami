"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export function MangaList() {
  const { data } = useQuery<{
    data: {
      cover_image_url: string;
      manga_id: string;
    }[];
  }>({
    queryKey: ["mangas", "list"],
    queryFn: async () => {
      const response = await fetch("https://api.shngm.io/v1/manga/list");
      return await response.json();
    },
  });

  return (
    <div className="container mx-auto grid grid-cols-4 gap-4 my-12">
      {data?.data.map((manga, key) => (
        <Link key={key} href={`/read/${manga.manga_id}`}>
          <Image
            alt={manga.cover_image_url}
            src={manga.cover_image_url}
            height={467}
            width={350}
          />
        </Link>
      ))}
    </div>
  );
}
