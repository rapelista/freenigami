import { TRPCError } from '@trpc/server';
import { z, ZodError } from 'zod';

import { PaginationSchema } from '~/schema/pagination';
import {
  SeriesDetailSchema,
  SeriesLatestSchema,
  SeriesListSchema,
  SeriesRecommendationSchema,
} from '~/schema/series';
import { TaxonomyItemSchema } from '~/schema/taxonomy';
import { fetchMangaList, fetchSeriesList } from '~/services/series/list';
import { fetchApi } from '~/lib/api';
import { appProcedure, router } from '~/trpc/init';

const TaxonomyListSchema = z.object({ data: z.array(TaxonomyItemSchema) });

export const seriesRouter = router({
  list: appProcedure
    .input(
      PaginationSchema.extend({
        q: z.string(),
        type: z.string(),
        status: z.string(),
        format: z.string(),
        subformat: z.string(),
        // Comma-separated slugs, e.g. "action,fantasy".
        genre: z.string(),
        theme: z.string(),
        min_chapters: z.number().int().min(1),
        sort: z.string(),
        sort_order: z.string(),
      })
        .partial()
        .optional()
        .default({
          page: 1,
          page_size: 24,
          sort: 'latest',
          sort_order: 'desc',
        }),
    )
    .query(async ({ input }) => {
      const data = await fetchSeriesList(input);
      const results = SeriesListSchema.parse(data);

      return results;
    }),

  taxonomy: appProcedure
    .input(z.object({ type: z.enum(['genre', 'theme']) }))
    .query(async ({ input }) => {
      const response = await fetchApi(
        `https://api.shinigami.io/v1/taxonomy/list?type=${input.type}&limit=100`,
        { next: { revalidate: 86_400 } },
      );

      if (!response.ok) {
        throw new TRPCError({ code: 'BAD_GATEWAY' });
      }

      return TaxonomyListSchema.parse(await response.json()).data;
    }),

  recommendation: appProcedure
    .input(
      z
        .object({
          format: z.string(),
        })
        .optional()
        .default({
          format: 'manhwa',
        }),
    )
    .query(async ({ input }) => {
      const data = await fetchMangaList({
        format: input.format,
        page: 1,
        page_size: 8,
        is_recommended: true,
        sort: 'latest',
        sort_order: 'desc',
      });

      try {
        const results = SeriesRecommendationSchema.parse(data);

        return results;
      } catch {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }
    }),

  latest: appProcedure
    .input(
      PaginationSchema.extend({
        type: z.string(),
        format: z.string(),
      })
        .partial()
        .optional()
        .default({
          page: 1,
          page_size: 24,
          type: 'project',
        }),
    )
    .query(async ({ input }) => {
      const data = await fetchMangaList({
        is_update: true,
        sort: 'latest',
        sort_order: 'desc',
        ...input,
      });

      try {
        const results = SeriesLatestSchema.parse(data);

        return results;
      } catch (e) {
        const error = e as ZodError;

        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: error.issues.map((issue) => issue.message).join(', '),
        });
      }
    }),

  detail: appProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      await new Promise((resolve) => setTimeout(resolve, 1_400));

      const url = new URL(
        `https://api.shinigami.io/v1/manga/detail/${input.id}`,
      );

      const response = await fetchApi(url);

      if (!response.ok) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }

      const data = await response.json();

      try {
        const series = SeriesDetailSchema.parse(data.data);

        return series;
      } catch (e) {
        const error = e as ZodError;

        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: error.issues.map((issue) => issue.message).join(', '),
        });
      }
    }),
});
