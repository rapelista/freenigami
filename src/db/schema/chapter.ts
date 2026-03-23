import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

import { series } from './series';

export const chapters = pgTable('chapters', {
  id: text().primaryKey(),

  seriesId: text('series_id')
    .notNull()
    .references(() => series.id, {
      onDelete: 'cascade',
    }),
});

export const chapterRelations = relations(chapters, ({ one }) => ({
  series: one(series, {
    fields: [chapters.seriesId],
    references: [series.id],
  }),
}));
