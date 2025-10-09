import { router } from '~/trpc/init';

import { chapterRouter } from './chapter';
import { seriesRouter } from './series';

export const appRouter = router({
  series: seriesRouter,
  chapter: chapterRouter,
});

export type AppRouter = typeof appRouter;
