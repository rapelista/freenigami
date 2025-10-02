import { z } from 'zod';

export const TaxonomyItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type TaxonomyItem = z.infer<typeof TaxonomyItemSchema>;

export const TaxonomySchema = z.object({
  Artist: z.array(TaxonomyItemSchema),
  Author: z.array(TaxonomyItemSchema),
  Genre: z.array(TaxonomyItemSchema),
  Type: z.array(TaxonomyItemSchema),
});

export type Taxonomy = z.infer<typeof TaxonomySchema>;
