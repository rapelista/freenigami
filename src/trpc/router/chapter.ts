import { TRPCError } from '@trpc/server';
import z, { ZodError } from 'zod';

import { generateDataSchema } from '~/lib/utils';
import { ChapterDetailSchema } from '~/schema/chapter';
import { PaginationSchema } from '~/schema/pagination';
import { fetchApi } from '~/lib/api';
import { fetchChapterList } from '~/services/chapter/list';
import { appProcedure, router } from '~/trpc/init';

export const chapterRouter = router({
  listBySeriesId: appProcedure
    .input(
      PaginationSchema.extend({
        search: z.string(),
        sort_order: z.enum(['asc', 'desc']),
        cursor: z.string().nullish(),
      })
        .partial()
        .extend({
          seriesId: z.string(),
        }),
    )
    .query(({ input }) =>
      fetchChapterList({
        seriesId: input.seriesId,
        page: input.page ?? 1,
        pageSize: input.page_size ?? 24,
        search: input.search,
        sortOrder: input.sort_order ?? 'desc',
        cursor: input.cursor,
      }),
    ),

  byId: appProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const url = new URL(`https://api.shngm.io/v1/chapter/detail/${input.id}`);

      const response = await fetchApi(url);

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
