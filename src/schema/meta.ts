import { z } from 'zod';

export const MetaSchema = z.object({
  page: z.number(),
  page_size: z.number(),
  total_page: z.number(),
  total_record: z.number(),
});

export type Meta = z.infer<typeof MetaSchema>;
