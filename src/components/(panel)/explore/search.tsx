'use client';

import {
  InputGroup,
  TextField,
  type InputGroupInputProps,
} from '@heroui/react';
import { Search } from 'lucide-react';
import { useQueryStates } from 'nuqs';

import { paginationParser, searchParser } from '~/lib/parser';

interface ExploreSearchProps extends InputGroupInputProps {}

export function ExploreSearch(props: ExploreSearchProps) {
  const [{ search }, setParams] = useQueryStates({
    ...paginationParser,
    ...searchParser,
  });

  return (
    <TextField aria-labelledby="Search" className="w-full">
      <InputGroup>
        <InputGroup.Prefix>
          <Search className="size-4 text-muted" />
        </InputGroup.Prefix>

        <InputGroup.Input
          {...props}
          placeholder="Cari berdasarkan judul manhwa, manga, atau manhua..."
          value={search}
          onChange={(e) => {
            setParams({ search: e.target.value });
          }}
        />
      </InputGroup>
    </TextField>
  );
}
