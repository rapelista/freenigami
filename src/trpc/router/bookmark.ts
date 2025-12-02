import z from 'zod';

import { authedProcudure, router } from '../init';

export const bookmarkRouter = router({
  series: authedProcudure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        thumbnailUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: _ }) => {
      const _userId = ctx.user.id;

      // console.log('Add Bookmark Series for', userId);
      // console.log(input);

      return {
        ok: true,
      };
    }),
});
