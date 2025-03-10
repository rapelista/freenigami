export type ChapterImageType = {
  chapter_number: number;
  base_url: string;
  chapter: {
    path: string;
    data: string[];
  };
  prev_chapter_number?: number;
  prev_chapter_id?: string;
  next_chapter_number?: number;
  next_chapter_id?: string;
};
