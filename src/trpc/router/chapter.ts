import { TRPCError } from '@trpc/server';
import z, { ZodError } from 'zod';

import { generateDataSchema, generateListSchema } from '~/lib/utils';
import { ChapterDetailSchema, ChapterSchema } from '~/schema/chapter';
import { PaginationSchema } from '~/schema/pagination';
import { appProcedure, router } from '~/trpc/init';

export const chapterRouter = router({
  listBySeriesId: appProcedure
    .input(
      PaginationSchema.extend({
        search: z.string(),
      })
        .partial()
        .extend({
          seriesId: z.string(),
        }),
    )
    .query(async ({ input }) => {
      const url = new URL(
        `https://api.shngm.io/v1/chapter/${input.seriesId}/list`,
      );

      url.searchParams.set('sort_by', 'chapter_number');
      url.searchParams.set('sort_order', 'desc');
      url.searchParams.set('page', input.page?.toString() || '1');
      url.searchParams.set('page_size', input.page_size?.toString() || '24');
      url.searchParams.set('search', input.search || '');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }

      const data = await response.json();

      try {
        return generateListSchema(ChapterSchema).parse(data);
      } catch (e) {
        const error = e as ZodError;

        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: error.issues.map((issue) => issue.message).join(', '),
        });
      }
    }),

  byId: appProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const url = new URL(`https://api.shngm.io/v1/chapter/detail/${input.id}`);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
        });
      }

      const data = await response.json();

      try {
        return generateDataSchema(ChapterDetailSchema).parse(data);
      } catch (e) {
        const error = e as ZodError;

        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: error.issues.map((issue) => issue.message).join(', '),
        });
      }
    }),
});
