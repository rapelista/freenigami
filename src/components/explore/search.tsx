'use client';

import { useQueryStates } from 'nuqs';

import { Input } from '~/components/ui/input';
import { paginationParser, searchParser } from '~/lib/parser';

export function ExploreSearch() {
  const [{ search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  return (
    <Input
      className="w-full"
      defaultValue={search}
      onChange={(e) => {
        setParams({ search: e.target.value, page: 1 });
      }}
    />
  );
}
