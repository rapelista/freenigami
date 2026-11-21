import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs';

import { BookmarkType } from './enum';

export const paginationParser = {
  // Push (not replace) so the browser's back/forward buttons step through
  // pages. Any update that sets `page` (e.g. tab changes resetting to 1)
  // pushes too; updates that leave `page` alone keep nuqs' default replace.
  page: parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
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
