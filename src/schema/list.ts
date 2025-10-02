import z from 'zod';

import { MetaSchema } from './meta';

export function generateListSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    meta: MetaSchema,
    data: z.array(itemSchema),
  });
}
