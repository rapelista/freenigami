import { router } from '~/trpc/init';

import { seriesRouter } from './series';

export const appRouter = router({
  series: seriesRouter,
});

export type AppRouter = typeof appRouter;
