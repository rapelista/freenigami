import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs';

import { searchParser } from '~/lib/parser';

export interface FilterOption<T extends string | number = string> {
  value: T;
  label: string;
}

export const TYPE_OPTIONS: FilterOption[] = [
  { value: 'project', label: 'Project' },
  { value: 'mirror', label: 'Mirror' },
];

export const STATUS_OPTIONS: FilterOption[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Tamat' },
  { value: 'hiatus', label: 'Hiatus' },
];

export const FORMAT_OPTIONS: FilterOption[] = [
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhua', label: 'Manhua' },
];

export const SUBFORMAT_OPTIONS: FilterOption[] = [
  { value: 'long-strip', label: 'Long Strip' },
  { value: 'web-comic', label: 'Web Comic' },
  { value: 'adaptation-2', label: 'Adaptasi' },
  { value: 'full-color', label: 'Full Color' },
];

export const MIN_CHAPTER_OPTIONS: FilterOption<number>[] = [
  { value: 10, label: '10' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
];

export const SORT_OPTIONS = [
  { value: 'new_manga', label: 'Seri terbaru', order: 'desc' },
  { value: 'latest', label: 'Update terbaru', order: 'desc' },
  { value: 'popularity', label: 'Paling populer', order: 'desc' },
  { value: 'rating', label: 'Rating tertinggi', order: 'desc' },
  { value: 'title', label: 'A-Z', order: 'asc' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

/** Series `status` codes returned by the API. */
export const STATUS_LABEL: Record<number, string> = {
  1: 'Ongoing',
  2: 'Tamat',
  3: 'Hiatus',
};

/** URL state of the explore page (also used to build links to it). */
export const exploreParsers = {
  ...searchParser,
  type: parseAsString,
  status: parseAsString,
  format: parseAsString,
  subformat: parseAsString,
  min: parseAsInteger,
  genre: parseAsArrayOf(parseAsString, ',').withDefault([]),
  theme: parseAsArrayOf(parseAsString, ',').withDefault([]),
  sort: parseAsStringLiteral(SORT_OPTIONS.map((o) => o.value)).withDefault(
    'latest',
  ),
};
