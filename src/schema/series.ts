import { z } from 'zod';

import { TaxonomySchema } from './taxonomy';

export const SeriesSchema = z.object({
  alternative_title: z.string(),
  bookmark_count: z.number(),
  country_id: z.string(),
  cover_image_url: z.string(),
  cover_portrait_url: z.string(),
  created_at: z.string(),
  deleted_at: z.string().nullable(),
  description: z.string(),
  is_recommended: z.boolean(),
  latest_chapter_id: z.string(),
  latest_chapter_number: z.number(),
  latest_chapter_time: z.string(),
  manga_id: z.string(),
  rank: z.number(),
  release_year: z.string(),
  status: z.number(),
  title: z.string(),
  updated_at: z.string(),
  user_rate: z.number(),
  view_count: z.number(),
  taxonomy: TaxonomySchema,
});

export type Series = z.infer<typeof SeriesSchema>;
