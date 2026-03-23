import { router } from '~/trpc/init';

import { bookmarkRouter } from './bookmark';
import { chapterRouter } from './chapter';
import { seriesRouter } from './series';

export const appRouter = router({
  series: seriesRouter,
  chapter: chapterRouter,
  bookmark: bookmarkRouter,
});

export type AppRouter = typeof appRouter;
