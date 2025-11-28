import { integer, pgTable } from 'drizzle-orm/pg-core';

export * from './auth';

export const series = pgTable('series', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
});
