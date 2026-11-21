import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { getAnimeList } from '~/services/anime/mikonime';
import { appProcedure, router } from '~/trpc/init';

export const animeRouter = router({
  /** Infinite list; `cursor` is the API offset. */
  list: appProcedure
    .input(
      z.object({
        cursor: z.number().int().min(0).nullish(),
        limit: z.number().int().min(1).max(60).default(30),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await getAnimeList({
          offset: input.cursor ?? 0,
          limit: input.limit,
        });
      } catch (e) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: e instanceof Error ? e.message : 'mikonime unavailable',
        });
      }
    }),
});
