import { TRPCError } from '@trpc/server';
import { z, ZodError } from 'zod';

import { PaginationSchema } from '~/schema/pagination';
import {
  SeriesDetailSchema,
  SeriesLatestSchema,
  SeriesListSchema,
  SeriesRecommendationSchema,
} from '~/schema/series';
import { appProcedure, router } from '~/trpc/init';

export const seriesRouter = router({
  list: appProcedure
    .input(
      PaginationSchema.extend({
        q: z.string(),
        format: z.string().optional(),
        sort: z.string().optional(),
        sort_order: z.string().optional(),
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
      try {
        const url = new URL('https://api.shngm.io/v1/manga/list');

        Object.entries(input).forEach(([key, value]) => {
          if (value) {
            url.searchParams.set(key, String(value));
          }
        });

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error('Failed to fetch data', { cause: response });
        }

        const data = await response.json();

        const results = SeriesListSchema.parse(data);

        return results;
      } catch {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }
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
      const url = new URL('https://api.shngm.io/v1/manga/list');

      url.searchParams.set('format', input.format);
      url.searchParams.set('page', '1');
      url.searchParams.set('page_size', '8');
      url.searchParams.set('is_recommended', 'true');
      url.searchParams.set('sort', 'latest');
      url.searchParams.set('sort_order', 'desc');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }

      const data = await response.json();

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
      const url = new URL('https://api.shngm.io/v1/manga/list');

      url.searchParams.set('is_update', 'true');
      url.searchParams.set('sort', 'latest');
      url.searchParams.set('sort_order', 'desc');

      Object.entries(input).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, String(value));
        }
      });

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }

      const data = await response.json();

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

      const url = new URL(`https://api.shngm.io/v1/manga/detail/${input.id}`);

      const response = await fetch(url.toString());

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
