import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

import { chapters } from './chapter';

export const series = pgTable('series', {
  id: text().primaryKey(),
  title: text().notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
});

export const seriesRelations = relations(series, ({ many }) => ({
  chapters: many(chapters),
}));
