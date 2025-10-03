import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { generateListSchema } from '~/schema/list';
import { PaginationSchema } from '~/schema/pagination';
import { SeriesSchema } from '~/schema/series';
import { appProcedure, router } from '~/trpc/init';

export const appRouter = router({
  series: router({
    list: appProcedure
      .input(
        PaginationSchema.extend({
          q: z.string(),
        })
          .partial()
          .optional()
          .default({
            page: 1,
            page_size: 24,
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
            throw new Error();
          }

          const data = await response.json();

          return generateListSchema(SeriesSchema).parse(data);
        } catch {
          throw new TRPCError({
            code: 'BAD_GATEWAY',
          });
        }
      }),

    recommendation: appProcedure.query(async () => {
      const url = new URL('https://api.shngm.io/v1/manga/list');

      url.searchParams.set('format', 'manhwa');
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
        return generateListSchema(SeriesSchema).parse(data);
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

        /**
         * Default Search Parameters
         */
        url.searchParams.set('is_update', 'true');
        url.searchParams.set('sort', 'latest');
        url.searchParams.set('sort_order', 'desc');

        /**
         * Dynamic Search Parameters
         */
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
          return generateListSchema(
            SeriesSchema.omit({ taxonomy: true }).extend({
              chapters: z.array(
                z.object({
                  chapter_id: z.string(),
                  chapter_number: z.number(),
                  created_at: z.string(),
                }),
              ),
            }),
          ).parse(data);
        } catch {
          throw new TRPCError({
            code: 'BAD_GATEWAY',
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
