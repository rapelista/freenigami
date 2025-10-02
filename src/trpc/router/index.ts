import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { generateListSchema } from '~/schema/list';
import { SeriesSchema } from '~/schema/series';
import { appProcedure, router } from '~/trpc/init';

export const appRouter = router({
  series: router({
    list: appProcedure.query(async () => {
      try {
        const url = new URL('https://api.shngm.io/v1/manga/list');
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
      const url = new URL(
        'https://api.shngm.io/v1/manga/list?format=manhwa&page=1&page_size=8&is_recommended=true&sort=latest&sort_order=desc',
      );

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

    latest: appProcedure.query(async () => {
      const url = new URL(
        'https://api.shngm.io/v1/manga/list?type=project&page=1&page_size=24&is_update=true&sort=latest&sort_order=desc',
      );

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
