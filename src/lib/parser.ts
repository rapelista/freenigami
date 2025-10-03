import { parseAsInteger } from 'nuqs';

export const paginationParser = {
  page: parseAsInteger.withDefault(1),
  page_size: parseAsInteger.withDefault(24),
};
