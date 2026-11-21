import { router } from '~/trpc/init';

import { animeRouter } from './anime';
import { chapterRouter } from './chapter';
import { seriesRouter } from './series';

export const appRouter = router({
  anime: animeRouter,
  series: seriesRouter,
  chapter: chapterRouter,
});

export type AppRouter = typeof appRouter;
