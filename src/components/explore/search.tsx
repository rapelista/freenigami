'use client';

import { Input, type InputProps } from '@heroui/react';
import { useQueryStates } from 'nuqs';

import { paginationParser, searchParser } from '~/lib/parser';

interface ExploreSearchProps extends InputProps {}

export function ExploreSearch(props: ExploreSearchProps) {
  const [{ search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  return (
    <Input
      {...props}
      placeholder="Cari berdasarkan judul manhwa, manga, atau manhua..."
      value={search}
      onChange={(e) => {
        setParams({ search: e.target.value });
      }}
    />
  );
}
