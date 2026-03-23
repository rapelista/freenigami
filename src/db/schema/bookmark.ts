import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { user } from './auth';

export const bookmarkedSeries = pgTable(
  'bookmarked_series',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    seriesId: text('series_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.seriesId] })],
);

export const bookmarkedSeriesRelations = relations(
  bookmarkedSeries,
  ({ one }) => ({
    user: one(user, {
      fields: [bookmarkedSeries.userId],
      references: [user.id],
    }),
  }),
);

export const bookmarkedChapters = pgTable(
  'bookmarked_chapters',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    seriesId: text('series_id').notNull(),

    chapterId: text('chapter_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.chapterId] })],
);

export const bookmarkedChaptersRelations = relations(
  bookmarkedChapters,
  ({ one }) => ({
    user: one(user, {
      fields: [bookmarkedChapters.userId],
      references: [user.id],
    }),
  }),
);
