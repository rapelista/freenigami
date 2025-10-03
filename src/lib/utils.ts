import type { ClassValue } from 'clsx';

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

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
