'use client';

import { useQueryStates } from 'nuqs';

import { paginationParser, searchParser } from '~/lib/parser';

import { SearchInput } from '../ui/search-input';

export function ExploreSearch() {
  const [{ search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  return (
    <SearchInput
      defaultValue={search}
      placeholder="Cari berdasarkan judul manhwa, manga, atau manhua..."
      onChange={(e) => {
        setParams({ search: e.target.value, page: 1 });
      }}
    />
  );
}
