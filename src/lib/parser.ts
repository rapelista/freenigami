import { parseAsInteger, parseAsString } from 'nuqs';

export const paginationParser = {
  page: parseAsInteger.withDefault(1),
  page_size: parseAsInteger.withDefault(24),
};

export const searchParser = {
  search: parseAsString.withDefault(''),
};
