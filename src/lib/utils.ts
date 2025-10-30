import type { ClassValue } from 'clsx';

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { MetaSchema } from '~/schema/meta';
import type { Bookmark } from '~/stores/bookmark';

import { BookmarkType } from './enum';

/**
 * Combine class names into a single string
 * @param classes - List of class names
 * @returns Combined class names
 */
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(...classes));
}

/**
 * Generate range of page numbers to display
 * @param start - Start number
 * @param end - End number
 * @returns Array of numbers
 */
export function range(start: number, end: number): number[] {
  const length = end - start + 1;

  return Array.from({ length }, (_, idx) => idx + start);
}

export function generateListSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    meta: MetaSchema,
    data: z.array(itemSchema),
  });
}

export function generateDataSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: itemSchema,
  });
}

export function checkIsBookmarked(
  bookmarks: Array<Bookmark>,
  bookmark: Bookmark,
) {
  for (const b of bookmarks) {
    if (b.type !== bookmark.type) continue;

    if (
      b.type === BookmarkType.SERIES &&
      bookmark.type === BookmarkType.SERIES
    ) {
      if (b.value === bookmark.value) return true;
    }

    if (
      b.type === BookmarkType.CHAPTERS &&
      bookmark.type === BookmarkType.CHAPTERS
    ) {
      if (
        b.value.seriesId === bookmark.value.seriesId &&
        b.value.chapterId === bookmark.value.chapterId
      ) {
        return true;
      }
    }
  }

  return false;
}
