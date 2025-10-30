'use client';

import { useQueryStates } from 'nuqs';

import { BookmarkType } from '~/lib/enum';
import { bookmarkTypeParser } from '~/lib/parser';

import { BookmarkChapters } from './chapters';
import { BookmarkSeries } from './series';

export function BookmarkList() {
  const [{ type }] = useQueryStates(bookmarkTypeParser);

  if (type === BookmarkType.SERIES) {
    return <BookmarkSeries />;
  } else if (type === BookmarkType.CHAPTERS) {
    return <BookmarkChapters />;
  }

  return null;
}
