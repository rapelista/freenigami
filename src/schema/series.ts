import { z } from 'zod';

import { generateListSchema } from '~/lib/utils';

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
  taxonomy: TaxonomySchema.partial(),
});

export type Series = z.infer<typeof SeriesSchema>;

export const SeriesDetailSchema = SeriesSchema.pick({
  title: true,
  alternative_title: true,
  description: true,
  cover_image_url: true,
  cover_portrait_url: true,
  view_count: true,
  user_rate: true,
  bookmark_count: true,
  rank: true,
  release_year: true,
  status: true,
  country_id: true,
  taxonomy: true,
});

export type SeriesDetail = z.infer<typeof SeriesDetailSchema>;

export const SeriesLatestSchema = generateListSchema(
  SeriesSchema.pick({
    manga_id: true,
    title: true,
    cover_image_url: true,
    cover_portrait_url: true,
  }).extend({
    chapters: z.array(
      z.object({
        chapter_id: z.string(),
        chapter_number: z.number(),
        created_at: z.string(),
      }),
    ),
  }),
);

export type SeriesLatest = z.infer<typeof SeriesLatestSchema>;

export const SeriesRecommendationSchema = generateListSchema(
  SeriesSchema.pick({
    manga_id: true,
    title: true,
    cover_image_url: true,
    cover_portrait_url: true,
  }),
);

export type SeriesRecommendation = z.infer<typeof SeriesRecommendationSchema>;

export const SeriesListSchema = generateListSchema(
  SeriesSchema.pick({
    manga_id: true,
    title: true,
    cover_image_url: true,
    cover_portrait_url: true,
  }),
);

export type SeriesList = z.infer<typeof SeriesListSchema>;
