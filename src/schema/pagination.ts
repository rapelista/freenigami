import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().min(1),
  page_size: z.number().min(1).max(100),
});
