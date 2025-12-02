import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

import { user } from './auth';
import { chapters } from './chapter';
import { series } from './series';

export const bookmarkedSeries = pgTable('bookmarked_series', {
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),

  seriesId: text('series_id')
    .notNull()
    .references(() => series.id, {
      onDelete: 'cascade',
    }),
});

export const bookmarkedSeriesRelations = relations(
  bookmarkedSeries,
  ({ one }) => ({
    user: one(user, {
      fields: [bookmarkedSeries.userId],
      references: [user.id],
    }),
    series: one(series, {
      fields: [bookmarkedSeries.seriesId],
      references: [series.id],
    }),
  }),
);

export const bookmarkedChapters = pgTable('bookmarked_chapters', {
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),

  chapterId: text('chapter_id')
    .notNull()
    .references(() => chapters.id, {
      onDelete: 'cascade',
    }),
});

export const bookmarkedChaptersRelations = relations(
  bookmarkedChapters,
  ({ one }) => ({
    user: one(user, {
      fields: [bookmarkedChapters.userId],
      references: [user.id],
    }),
    chapter: one(chapters, {
      fields: [bookmarkedChapters.chapterId],
      references: [chapters.id],
    }),
  }),
);
