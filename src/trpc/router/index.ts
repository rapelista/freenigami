import { appProcedure, router } from '~/trpc/init';

export const appRouter = router({
  series: router({
    list: appProcedure.query(() => {
      return {
        data: [
          {
            id: 1,
          },
        ],
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
