import { z } from 'zod';

export const ChapterSchema = z.object({
  chapter_id: z.string(),
  manga_id: z.string(),
  chapter_title: z.string(),
  chapter_number: z.number(),
  thumbnail_image_url: z.string().nullish(),
  view_count: z.number(),
  release_date: z.string(),
});

export type Chapter = z.infer<typeof ChapterSchema>;

export const ChapterDetailSchema = ChapterSchema.extend({
  base_url: z.string(),
  prev_chapter_id: z.string().nullish(),
  prev_chapter_number: z.number().nullish(),
  next_chapter_id: z.string().nullish(),
  next_chapter_number: z.number().nullish(),
  chapter: z.object({
    path: z.string(),
    data: z.array(z.string()),
  }),
});
