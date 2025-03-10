"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function ButtonBack() {
  const router = useRouter();

  return (
    <Button
      variant="link"
      className="has-[>svg]:ps-0"
      onClick={() => router.back()}
    >
      <ChevronLeftIcon />
      Kembali
    </Button>
  );
}
