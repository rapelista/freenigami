import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { appProcedure, router } from '~/trpc/init';

const schema = z.object({
  data: z.array(
    z.object({
      manga_id: z.string(),
      title: z.string(),
      alternative_title: z.string(),
      country_id: z.string(),
      cover_image_url: z.string(),
      cover_portrait_url: z.string(),
      chapters: z.array(
        z.object({
          chapter_id: z.string(),
          chapter_number: z.number(),
          created_at: z.string(),
        }),
      ),
    }),
  ),
});

export const appRouter = router({
  series: router({
    list: appProcedure.query(async () => {
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
        return schema.parse(data);
      } catch {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
