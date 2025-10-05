'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';

import { useAppStore } from '~/stores/app';
import { trpc } from '~/trpc/client';

export function BookmarkList() {
  const bookmarks = useAppStore((state) => state.bookmarks);

  const results = useQueries({
    queries: bookmarks.map((id) => trpc.series.detail.queryOptions({ id })),
  });

  return results.map((result, key) => {
    if (result.isLoading) {
      return <div key={key}>Loading...</div>;
    }

    return (
      <div key={key}>
        <Link href={`/series/${bookmarks[key]}`}>{result.data?.title}</Link>
      </div>
    );
  });
}
