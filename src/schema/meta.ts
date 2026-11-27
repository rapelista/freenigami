import { z } from 'zod';

export const MetaSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(1),
  total_page: z.number().default(1),
  total_record: z.number().default(0),
  /** Offset of the next page for offset-based lists; null at the end. */
  next_offset: z.number().nullish(),
});

export type Meta = z.infer<typeof MetaSchema>;
