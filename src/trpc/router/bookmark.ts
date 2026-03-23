import { and, eq } from 'drizzle-orm';
import z from 'zod';

import { db } from '~/db';
import { bookmarkedChapters, bookmarkedSeries } from '~/db/schema';
import { authedNonAnonymousProcedure, router } from '../init';

export const bookmarkRouter = router({
  list: authedNonAnonymousProcedure.query(async ({ ctx }) => {
    const [series, chapters] = await Promise.all([
      db
        .select()
        .from(bookmarkedSeries)
        .where(eq(bookmarkedSeries.userId, ctx.user.id)),
      db
        .select()
        .from(bookmarkedChapters)
        .where(eq(bookmarkedChapters.userId, ctx.user.id)),
    ]);
    return { series, chapters };
  }),

  addSeries: authedNonAnonymousProcedure
    .input(z.object({ seriesId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .insert(bookmarkedSeries)
        .values({ userId: ctx.user.id, seriesId: input.seriesId })
        .onConflictDoNothing();
    }),

  removeSeries: authedNonAnonymousProcedure
    .input(z.object({ seriesId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(bookmarkedSeries).where(
        and(
          eq(bookmarkedSeries.userId, ctx.user.id),
          eq(bookmarkedSeries.seriesId, input.seriesId),
        ),
      );
    }),

  addChapter: authedNonAnonymousProcedure
    .input(z.object({ seriesId: z.string(), chapterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .insert(bookmarkedChapters)
        .values({
          userId: ctx.user.id,
          seriesId: input.seriesId,
          chapterId: input.chapterId,
        })
        .onConflictDoNothing();
    }),

  removeChapter: authedNonAnonymousProcedure
    .input(z.object({ chapterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(bookmarkedChapters).where(
        and(
          eq(bookmarkedChapters.userId, ctx.user.id),
          eq(bookmarkedChapters.chapterId, input.chapterId),
        ),
      );
    }),

  syncFromLocal: authedNonAnonymousProcedure
    .input(
      z.object({
        series: z.array(z.string()),
        chapters: z.array(
          z.object({ seriesId: z.string(), chapterId: z.string() }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      await Promise.all([
        input.series.length > 0
          ? db
              .insert(bookmarkedSeries)
              .values(input.series.map((seriesId) => ({ userId, seriesId })))
              .onConflictDoNothing()
          : Promise.resolve(),
        input.chapters.length > 0
          ? db
              .insert(bookmarkedChapters)
              .values(
                input.chapters.map(({ seriesId, chapterId }) => ({
                  userId,
                  seriesId,
                  chapterId,
                })),
              )
              .onConflictDoNothing()
          : Promise.resolve(),
      ]);
    }),
});
