import { BookmarkIcon } from "lucide-react";
import { Button } from "../ui/button";

export function MangaBookmark() {
  return (
    <>
      <Button
        size="icon"
        variant="secondary"
        className="inline-flex md:hidden"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <BookmarkIcon />
      </Button>
      <Button
        className="hidden md:inline-flex"
        variant="secondary"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <BookmarkIcon />
        Bookmark
      </Button>
    </>
  );
}
