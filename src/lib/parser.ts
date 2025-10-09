import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs';

import { BookmarkType } from './enum';

export const paginationParser = {
  page: parseAsInteger.withDefault(1),
  page_size: parseAsInteger.withDefault(24),
};

export const searchParser = {
  search: parseAsString.withDefault(''),
};

export const bookmarkTypeParser = {
  type: parseAsStringEnum<BookmarkType>(
    Object.values(BookmarkType),
  ).withDefault(BookmarkType.SERIES),
};
