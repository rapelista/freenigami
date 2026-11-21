import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs';

import { ANIME_SORTS, ANIME_STATUSES } from './anime';

/**
 * URL state of the browse page. Kept apart from `~/lib/anime` because
 * `nuqs` is client-only, while that module is also used on the server.
 */
export const browseParsers = {
  search: parseAsString.withDefault(''),
  genre: parseAsArrayOf(parseAsString, ',').withDefault([]),
  format: parseAsString,
  status: parseAsStringLiteral(ANIME_STATUSES),
  year: parseAsInteger,
  studio: parseAsString,
  sort: parseAsStringLiteral(ANIME_SORTS),
  page: parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
};
