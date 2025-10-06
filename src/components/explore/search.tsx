'use client';

import { useQueryStates } from 'nuqs';

import { paginationParser, searchParser } from '~/lib/parser';

import { SearchInput, type SearchInputProps } from '../ui/search-input';

interface ExploreSearchProps extends SearchInputProps {}

export function ExploreSearch(props: ExploreSearchProps) {
  const [{ search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  return (
    <SearchInput
      {...props}
      defaultValue={search}
      placeholder="Cari berdasarkan judul manhwa, manga, atau manhua..."
      onChange={(e) => {
        setParams({ search: e.target.value, page: 1 });
      }}
    />
  );
}
